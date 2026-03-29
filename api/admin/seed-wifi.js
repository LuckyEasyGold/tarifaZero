// POST /api/admin/seed-wifi - Popular redes Wi-Fi dos ônibus
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔌 Populando redes Wi-Fi dos ônibus...');

    // Linha L001 - Expresso Palmas
    const linha001 = await prisma.line.findFirst({
      where: { code: 'L001' }
    });

    if (linha001) {
      const wifi = await prisma.wifiNetwork.upsert({
        where: {
          lineId_ssid: {
            lineId: linha001.id,
            ssid: 'Expresso Palmas'
          }
        },
        update: {
          bssid: 'f8:5e:3c:64:2f:6a',
          description: 'Wi-Fi oficial do ônibus L001',
          active: true
        },
        create: {
          lineId: linha001.id,
          ssid: 'Expresso Palmas',
          bssid: 'f8:5e:3c:64:2f:6a',
          description: 'Wi-Fi oficial do ônibus L001',
          active: true
        }
      });
      console.log('✅ Wi-Fi da Linha L001 cadastrado:', wifi);
    }

    await prisma.$disconnect();

    return res.status(200).json({
      success: true,
      message: 'Wi-Fi networks seeded successfully',
      data: {
        linesProcessed: linha001 ? 1 : 0
      }
    });
  } catch (error) {
    console.error('❌ Erro ao popular Wi-Fi:', error);
    await prisma.$disconnect();
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
