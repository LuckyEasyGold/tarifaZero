// GET /api/lines - Listar todas as linhas
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(_req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const lines = await prisma.line.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        color: true,
        colorHex: true,
        startTime: true,
        endTime: true,
        intervalMin: true,
        _count: {
          select: {
            stops: true,
            routes: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    return res.status(200).json({
      success: true,
      data: lines,
      meta: {
        total: lines.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error fetching lines:', err);
    await prisma.$disconnect();
    
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Failed to fetch lines',
        code: 'DATABASE_ERROR',
      },
    });
  }
}
