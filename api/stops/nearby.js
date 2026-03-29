// GET /api/stops/nearby?lat=X&lng=Y&radius=500 - Paradas próximas
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const { lat, lng, radius = 500 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: { 
        message: 'Latitude and longitude are required', 
        code: 'MISSING_COORDINATES' 
      },
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusMeters = parseInt(radius);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid coordinates or radius', code: 'INVALID_PARAMS' },
    });
  }

  try {
    // Query usando PostGIS para calcular distância
    const stops = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.code,
        s.name,
        s.lat,
        s.lng,
        s.description,
        l.code as "lineCode",
        l.name as "lineName",
        l."colorHex" as "lineColor",
        ST_Distance(
          ST_MakePoint(s.lng, s.lat)::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography
        ) as distance
      FROM stops s
      JOIN lines l ON s."lineId" = l.id
      WHERE s.active = true
        AND ST_DWithin(
          ST_MakePoint(s.lng, s.lat)::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${radiusMeters}
        )
      ORDER BY distance
      LIMIT 20
    `;

    await prisma.$disconnect();

    return res.status(200).json({
      success: true,
      data: stops.map(stop => ({
        ...stop,
        distance: Math.round(Number(stop.distance)),
      })),
      meta: {
        total: stops.length,
        searchRadius: radiusMeters,
        center: { lat: latitude, lng: longitude },
      },
    });
  } catch (err) {
    console.error('Error fetching nearby stops:', err);
    await prisma.$disconnect();
    
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Failed to fetch nearby stops',
        code: 'DATABASE_ERROR',
      },
    });
  }
}
