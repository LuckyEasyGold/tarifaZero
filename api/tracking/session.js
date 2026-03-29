import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  try {
    const { action, lineId, sessionId } = req.body;

    if (action === 'start') {
      // Iniciar nova sessão
      if (!lineId) {
        return res.status(400).json({
          success: false,
          error: 'lineId é obrigatório para iniciar sessão'
        });
      }

      // Buscar a primeira rota da linha
      const route = await prisma.route.findFirst({
        where: { lineId }
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          error: 'Nenhuma rota encontrada para esta linha'
        });
      }

      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 horas

      const trip = await prisma.trip.create({
        data: {
          lineId,
          routeId: route.id,
          scheduledStart: now,
          scheduledEnd: endTime,
          actualStart: now,
          status: 'active',
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          sessionId: trip.id,
          startTime: trip.actualStart,
          message: 'Sessão de tracking iniciada'
        }
      });

    } else if (action === 'stop') {
      // Finalizar sessão
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId é obrigatório para finalizar sessão'
        });
      }

      const trip = await prisma.trip.update({
        where: { id: sessionId },
        data: {
          actualEnd: new Date(),
          status: 'completed',
        }
      });

      // Contar quantos pontos foram coletados
      const trackCount = await prisma.userTrack.count({
        where: { sessionId }
      });

      return res.status(200).json({
        success: true,
        data: {
          sessionId: trip.id,
          startTime: trip.actualStart,
          endTime: trip.actualEnd,
          pointsCollected: trackCount,
          message: 'Sessão de tracking finalizada'
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        error: 'Ação inválida. Use "start" ou "stop"'
      });
    }

  } catch (error) {
    console.error('Erro ao gerenciar sessão:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerenciar sessão de tracking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
