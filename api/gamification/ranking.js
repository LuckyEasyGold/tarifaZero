import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  try {
    const { period = 'all', limit = 10 } = req.query;

    let whereClause = {};

    // Filtrar por período
    if (period === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      whereClause.lastActive = {
        gte: startOfMonth
      };
    } else if (period === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      
      whereClause.lastActive = {
        gte: startOfWeek
      };
    }

    // Buscar top usuários
    const topUsers = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        points: 'desc'
      },
      take: parseInt(limit),
      select: {
        id: true,
        nickname: true,
        points: true,
        level: true,
        totalTrips: true,
        totalPoints: true,
        totalMinutes: true,
        badges: true,
        streak: true,
        createdAt: true,
      }
    });

    // Adicionar posição no ranking
    const ranking = topUsers.map((user, index) => ({
      ...user,
      position: index + 1,
      nickname: user.nickname || `Usuário #${user.id.slice(-4)}`
    }));

    // Estatísticas gerais
    const stats = await prisma.user.aggregate({
      _count: true,
      _sum: {
        points: true,
        totalTrips: true,
        totalPoints: true,
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        ranking,
        stats: {
          totalUsers: stats._count,
          totalPoints: stats._sum.points || 0,
          totalTrips: stats._sum.totalTrips || 0,
          totalGPSPoints: stats._sum.totalPoints || 0,
        },
        period,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar ranking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
