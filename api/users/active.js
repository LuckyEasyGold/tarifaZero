import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Buscar usuários que estiveram ativos nos últimos 5 minutos
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await prisma.user.findMany({
      where: {
        isOnline: true,
        lastActive: {
          gte: fiveMinutesAgo
        },
        currentLat: {
          not: null
        },
        currentLng: {
          not: null
        }
      },
      select: {
        anonymousId: true,
        nickname: true,
        currentLat: true,
        currentLng: true,
        isTracking: true,
        lastActive: true,
        level: true,
        points: true
      },
      orderBy: {
        lastActive: 'desc'
      }
    });

    return res.status(200).json({
      users: activeUsers,
      count: activeUsers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuários ativos:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar usuários ativos',
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
