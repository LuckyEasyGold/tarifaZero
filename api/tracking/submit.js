import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Configurar CORS
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
    const {
      lineId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      wifiSSID,
      wifiSignalStrength,
      sessionId
    } = req.body;

    // Validações básicas
    if (!lineId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando (lineId, latitude, longitude)'
      });
    }

    // Validar coordenadas
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Coordenadas inválidas'
      });
    }

    // Criar registro de tracking
    const track = await prisma.userTrack.create({
      data: {
        userId: 'anonymous', // Por enquanto todos são anônimos
        lineId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null,
        sessionId: sessionId || 'no-session',
        timestamp: new Date(),
      }
    });

    // Se houver informação de Wi-Fi, salvar também
    if (wifiSSID) {
      // Verificar se já existe essa rede Wi-Fi cadastrada
      const existingWifi = await prisma.wifiNetwork.findFirst({
        where: {
          lineId,
          ssid: wifiSSID
        }
      });

      // Se não existir, criar
      if (!existingWifi) {
        await prisma.wifiNetwork.create({
          data: {
            lineId,
            ssid: wifiSSID,
            description: `Detectado em ${new Date().toISOString()}`,
            active: true,
          }
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        id: track.id,
        message: 'Dados de tracking salvos com sucesso'
      }
    });

  } catch (error) {
    console.error('Erro ao salvar tracking:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao salvar dados de tracking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
