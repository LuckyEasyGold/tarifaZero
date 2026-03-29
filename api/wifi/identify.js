// POST /api/wifi/identify - Identificar linha pelo Wi-Fi detectado
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { networks } = req.body;

  if (!networks || !Array.isArray(networks)) {
    return res.status(400).json({
      success: false,
      error: 'Networks array is required'
    });
  }

  try {
    // Buscar todas as redes Wi-Fi cadastradas
    const registeredWifis = await prisma.wifiNetwork.findMany({
      where: { active: true },
      include: {
        line: {
          select: {
            id: true,
            code: true,
            name: true,
            colorHex: true
          }
        }
      }
    });

    // Tentar identificar por BSSID (mais preciso)
    for (const network of networks) {
      if (network.bssid) {
        const match = registeredWifis.find(
          wifi => wifi.bssid && wifi.bssid.toLowerCase() === network.bssid.toLowerCase()
        );
        
        if (match) {
          await prisma.$disconnect();
          return res.status(200).json({
            success: true,
            identified: true,
            matchType: 'bssid',
            line: match.line,
            wifi: {
              ssid: match.ssid,
              bssid: match.bssid
            },
            confidence: 1.0 // 100% de confiança com BSSID
          });
        }
      }
    }

    // Tentar identificar por SSID (menos preciso)
    for (const network of networks) {
      if (network.ssid) {
        const match = registeredWifis.find(
          wifi => wifi.ssid.toLowerCase() === network.ssid.toLowerCase()
        );
        
        if (match) {
          await prisma.$disconnect();
          return res.status(200).json({
            success: true,
            identified: true,
            matchType: 'ssid',
            line: match.line,
            wifi: {
              ssid: match.ssid,
              bssid: match.bssid
            },
            confidence: 0.8 // 80% de confiança com SSID
          });
        }
      }
    }

    // Nenhuma correspondência encontrada
    await prisma.$disconnect();
    return res.status(200).json({
      success: true,
      identified: false,
      message: 'No matching bus Wi-Fi found',
      registeredCount: registeredWifis.length
    });

  } catch (error) {
    console.error('Error identifying Wi-Fi:', error);
    await prisma.$disconnect();
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
