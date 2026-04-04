/**
 * API Endpoint: GET /api/lines/[id]/trajectories
 * 
 * Lista trajetórias de uma linha com filtro por status
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { id } = req.query;
    const statusParam = (req.query.status as string) || 'verified';
    const limit = parseInt((req.query.limit as string) || '50');
    const offset = parseInt((req.query.offset as string) || '0');

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID da linha é obrigatório'
      });
    }

    // Verificar se linha existe
    const line = await prisma.line.findUnique({
      where: { id },
      select: { id: true, code: true, name: true }
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        error: 'Linha não encontrada'
      });
    }

    // Preparar filtro de status
    let statusFilter: any = undefined;
    
    if (statusParam === 'all') {
      // Sem filtro
      statusFilter = undefined;
    } else if (statusParam.includes(',')) {
      // Múltiplos status
      statusFilter = { in: statusParam.split(',') };
    } else {
      // Status único
      statusFilter = statusParam;
    }

    // Buscar trajetórias
    const trajectories = await prisma.trajectory.findMany({
      where: {
        lineId: id,
        status: statusFilter,
        // Se buscar apenas verified, filtrar por trust score alto
        ...(statusParam === 'verified' && { trustScore: { gte: 0.7 } })
      },
      select: {
        id: true,
        direction: true,
        status: true,
        trustScore: true,
        points: true,
        metadata: true,
        createdAt: true,
        verifiedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            trustScore: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // verified primeiro
        { trustScore: 'desc' }, // maior confiança primeiro
        { createdAt: 'desc' } // mais recente primeiro
      ],
      take: limit,
      skip: offset
    });

    // Contar total
    const total = await prisma.trajectory.count({
      where: {
        lineId: id,
        status: statusFilter
      }
    });

    // Contar por status
    const statusCounts = await prisma.trajectory.groupBy({
      by: ['status'],
      where: { lineId: id },
      _count: true
    });

    // Formatar resposta
    const formattedTrajectories = trajectories.map(t => ({
      ...t,
      confidence: t.trustScore >= 0.8 ? 'high' : t.trustScore >= 0.6 ? 'medium' : 'low',
      pointsCount: Array.isArray(t.points) ? (t.points as any[]).length : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        line: {
          id: line.id,
          code: line.code,
          name: line.name
        },
        trajectories: formattedTrajectories,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        stats: {
          byStatus: statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          verified: statusCounts.find(s => s.status === 'verified')?._count || 0,
          pending: statusCounts.find(s => s.status === 'pending')?._count || 0,
          draft: statusCounts.find(s => s.status === 'draft')?._count || 0,
          rejected: statusCounts.find(s => s.status === 'rejected')?._count || 0
        }
      }
    });

  } catch (error) {
    console.error('[API] Erro ao buscar trajetórias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await prisma.$disconnect();
  }
}
