// GET /api/lines/[id] - Detalhes de uma linha específica
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Line ID is required', code: 'MISSING_ID' },
    });
  }

  try {
    const line = await prisma.line.findUnique({
      where: { id: String(id) },
      include: {
        routes: {
          include: {
            points: {
              orderBy: { sequence: 'asc' },
              select: {
                lat: true,
                lng: true,
                sequence: true,
              },
            },
          },
        },
        stops: {
          where: { active: true },
          orderBy: { code: 'asc' },
          select: {
            id: true,
            code: true,
            name: true,
            lat: true,
            lng: true,
            description: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    if (!line) {
      return res.status(404).json({
        success: false,
        error: { message: 'Line not found', code: 'NOT_FOUND' },
      });
    }

    return res.status(200).json({
      success: true,
      data: line,
    });
  } catch (err) {
    console.error('Error fetching line:', err);
    await prisma.$disconnect();
    
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Failed to fetch line',
        code: 'DATABASE_ERROR',
      },
    });
  }
}
