import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { anonymousId } = req.query;

    if (!anonymousId) {
      return res.status(400).json({
        success: false,
        error: 'anonymousId é obrigatório'
      });
    }

    if (req.method === 'GET') {
      // Buscar ou criar usuário
      let user = await prisma.user.findUnique({
        where: { anonymousId }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            anonymousId,
            points: 0,
            level: 1,
          }
        });
      }

      // Buscar posição no ranking
      const usersAbove = await prisma.user.count({
        where: {
          points: {
            gt: user.points
          }
        }
      });

      const position = usersAbove + 1;

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          position,
          nickname: user.nickname || `Usuário #${user.id.slice(-4)}`
        }
      });

    } else if (req.method === 'POST') {
      // Atualizar estatísticas do usuário
      const { action, value, nickname } = req.body;

      let updateData = {
        lastActive: new Date()
      };

      // Calcular pontos baseado na ação
      let pointsToAdd = 0;

      switch (action) {
        case 'gps_point':
          pointsToAdd = 1;
          updateData.totalPoints = { increment: 1 };
          break;
        case 'trip_minute':
          pointsToAdd = 5;
          updateData.totalMinutes = { increment: value || 1 };
          break;
        case 'trip_complete':
          pointsToAdd = 50;
          updateData.totalTrips = { increment: 1 };
          break;
        case 'wifi_detected':
          pointsToAdd = 100;
          break;
        case 'stop_validated':
          pointsToAdd = 200;
          break;
        case 'set_nickname':
          if (nickname) {
            updateData.nickname = nickname;
          }
          break;
        default:
          pointsToAdd = 0;
      }

      if (pointsToAdd > 0) {
        updateData.points = { increment: pointsToAdd };
      }

      // Atualizar usuário
      const user = await prisma.user.update({
        where: { anonymousId },
        data: updateData
      });

      // Calcular nível baseado em pontos
      const newLevel = Math.floor(user.points / 1000) + 1;
      if (newLevel !== user.level) {
        await prisma.user.update({
          where: { anonymousId },
          data: { level: newLevel }
        });
      }

      // Verificar badges
      const badges = [];
      if (user.totalTrips >= 1) badges.push('first_trip');
      if (user.totalTrips >= 10) badges.push('frequent_rider');
      if (user.totalTrips >= 50) badges.push('super_rider');
      if (user.totalPoints >= 100) badges.push('gps_collector');
      if (user.totalPoints >= 1000) badges.push('gps_master');
      if (user.streak >= 7) badges.push('week_streak');
      if (user.streak >= 30) badges.push('month_streak');

      if (badges.length > 0) {
        await prisma.user.update({
          where: { anonymousId },
          data: { badges }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          pointsAdded: pointsToAdd,
          totalPoints: user.points,
          level: newLevel,
          badges,
          message: pointsToAdd > 0 ? `+${pointsToAdd} pontos!` : 'Atualizado'
        }
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

  } catch (error) {
    console.error('Erro ao gerenciar usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerenciar usuário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
