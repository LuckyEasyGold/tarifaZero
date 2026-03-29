import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { anonymousId, lat, lng, isTracking } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'anonymousId é obrigatório' });
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { anonymousId }
    });

    if (!user) {
      // Criar usuário se não existir
      user = await prisma.user.create({
        data: {
          anonymousId,
          nickname: null,
          acceptedTerms: true,
          acceptedTermsDate: new Date(),
          isOnline: true,
          currentLat: lat || null,
          currentLng: lng || null,
          isTracking: isTracking || false,
          lastActive: new Date()
        }
      });
    } else {
      // Atualizar usuário existente
      user = await prisma.user.update({
        where: { anonymousId },
        data: {
          isOnline: true,
          currentLat: lat || user.currentLat,
          currentLng: lng || user.currentLng,
          isTracking: isTracking !== undefined ? isTracking : user.isTracking,
          lastActive: new Date()
        }
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        anonymousId: user.anonymousId,
        nickname: user.nickname,
        isOnline: user.isOnline,
        level: user.level,
        points: user.points
      }
    });

  } catch (error) {
    console.error('❌ Erro no heartbeat:', error);
    return res.status(500).json({ 
      error: 'Erro ao atualizar heartbeat',
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
