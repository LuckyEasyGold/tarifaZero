// GET /api/lines/[id]/map - Dados otimizados para renderizar no mapa
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
      select: {
        id: true,
        code: true,
        name: true,
        color: true,
        colorHex: true,
        startTime: true,
        endTime: true,
        intervalMin: true,
      },
    });

    if (!line) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: { message: 'Line not found', code: 'NOT_FOUND' },
      });
    }

    // Buscar rota (pontos GPS)
    const routes = await prisma.route.findMany({
      where: { lineId: String(id), active: true },
      include: {
        points: {
          orderBy: { sequence: 'asc' },
          select: { lat: true, lng: true },
        },
      },
    });

    // Buscar paradas
    const stops = await prisma.stop.findMany({
      where: { lineId: String(id), active: true },
      select: {
        id: true,
        code: true,
        name: true,
        lat: true,
        lng: true,
        description: true,
      },
    });

    await prisma.$disconnect();

    // Formatar dados para o mapa (compatível com Leaflet)
    const mapData = {
      line: line,
      route: routes[0]?.points || [],
      stops: stops,
      bounds: calculateBounds(routes[0]?.points || []),
    };

    return res.status(200).json({
      success: true,
      data: mapData,
    });
  } catch (err) {
    console.error('Error fetching map data:', err);
    await prisma.$disconnect();
    
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Failed to fetch map data',
        code: 'DATABASE_ERROR',
      },
    });
  }
}

// Helper para calcular bounds do mapa
function calculateBounds(points) {
  if (!points || points.length === 0) {
    return null;
  }

  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}
