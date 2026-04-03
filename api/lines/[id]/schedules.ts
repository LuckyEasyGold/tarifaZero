import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const schedules = await prisma.scheduledTime.findMany({
      where: {
        lineId: id as string,
        active: true,
      },
      include: {
        stop: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        time: 'asc',
      },
    });

    const formatted = schedules.map(s => ({
      id: s.id,
      time: s.time,
      stopId: s.stopId,
      stopName: s.stop.name,
      dayOfWeek: s.dayOfWeek,
      direction: s.direction,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar horários',
    });
  } finally {
    await prisma.$disconnect();
  }
}
