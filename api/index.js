import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper para CORS
const setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Router principal
export default async function handler(req, res) {
  setCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const path = url.replace('/api', '');

  try {
    // Health check
    if (path === '/' || path === '') {
      return res.status(200).json({
        success: true,
        message: 'Tarifa Zero API v2.1',
        timestamp: new Date().toISOString()
      });
    }

    // Lines endpoints
    if (path.startsWith('/lines')) {
      return await handleLines(req, res, path);
    }

    // Stops endpoints
    if (path.startsWith('/stops')) {
      return await handleStops(req, res, path);
    }

    // Tracking endpoints
    if (path.startsWith('/tracking')) {
      return await handleTracking(req, res, path);
    }

    // Gamification endpoints
    if (path.startsWith('/gamification')) {
      return await handleGamification(req, res, path);
    }

    // Users endpoints
    if (path.startsWith('/users')) {
      return await handleUsers(req, res, path);
    }

    // WiFi endpoints
    if (path.startsWith('/wifi')) {
      return await handleWifi(req, res, path);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Lines handlers
async function handleLines(req, res, path) {
  // GET /lines
  if (path === '/lines' && req.method === 'GET') {
    const lines = await prisma.line.findMany({
      include: {
        _count: {
          select: { stops: true }
        }
      },
      orderBy: { code: 'asc' }
    });
    return res.status(200).json({ success: true, data: lines });
  }

  // GET /lines/:id
  const lineIdMatch = path.match(/^\/lines\/([^\/]+)$/);
  if (lineIdMatch && req.method === 'GET') {
    const id = lineIdMatch[1];
    const line = await prisma.line.findUnique({
      where: { id },
      include: {
        routes: {
          include: {
            points: {
              orderBy: { sequence: 'asc' }
            }
          }
        },
        stops: {
          orderBy: { code: 'asc' }
        }
      }
    });

    if (!line) {
      return res.status(404).json({ success: false, error: 'Linha não encontrada' });
    }

    return res.status(200).json({ success: true, data: line });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}

// Stops handlers
async function handleStops(req, res, path) {
  // GET /stops/nearby
  if (path.startsWith('/stops/nearby') && req.method === 'GET') {
    const { lat, lng, radius = 500 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat e lng são obrigatórios' });
    }

    const stops = await prisma.$queryRaw`
      SELECT id, name, lat, lng, code, description,
        ST_Distance(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)})::geography
        ) as distance
      FROM stops
      WHERE ST_DWithin(
        ST_MakePoint(lng, lat)::geography,
        ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)})::geography,
        ${parseFloat(radius)}
      )
      ORDER BY distance
      LIMIT 10
    `;

    return res.status(200).json({ success: true, data: stops });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}

// Tracking handlers
async function handleTracking(req, res, path) {
  if (path === '/tracking/session' && req.method === 'POST') {
    const { userId, lineId, action } = req.body;
    
    if (action === 'start') {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return res.status(200).json({ success: true, sessionId });
    }
    
    return res.status(200).json({ success: true });
  }

  if (path === '/tracking/submit' && req.method === 'POST') {
    const { sessionId, points } = req.body;
    
    if (!sessionId || !points || !Array.isArray(points)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Salvar pontos no banco
    await prisma.userTrack.createMany({
      data: points.map(p => ({
        userId: p.userId || 'anonymous',
        sessionId,
        lineId: p.lineId,
        lat: p.lat,
        lng: p.lng,
        speed: p.speed,
        heading: p.heading,
        accuracy: p.accuracy,
        timestamp: new Date(p.timestamp)
      }))
    });

    return res.status(200).json({ success: true, pointsReceived: points.length });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}

// Gamification handlers
async function handleGamification(req, res, path) {
  if (path.startsWith('/gamification/ranking') && req.method === 'GET') {
    const { period = 'all', limit = 10 } = req.query;
    
    const users = await prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: parseInt(limit),
      select: {
        anonymousId: true,
        nickname: true,
        points: true,
        level: true,
        totalTrips: true,
        badges: true
      }
    });

    return res.status(200).json({ success: true, data: users });
  }

  if (path.startsWith('/gamification/user') && req.method === 'GET') {
    const { anonymousId } = req.query;
    
    if (!anonymousId) {
      return res.status(400).json({ error: 'anonymousId é obrigatório' });
    }

    const user = await prisma.user.findUnique({
      where: { anonymousId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json({ success: true, data: user });
  }

  if (path.startsWith('/gamification/user') && req.method === 'POST') {
    const { anonymousId, nickname, points } = req.body;
    
    const user = await prisma.user.upsert({
      where: { anonymousId },
      update: {
        points: { increment: points || 0 },
        nickname: nickname || undefined
      },
      create: {
        anonymousId,
        nickname: nickname || null,
        points: points || 0
      }
    });

    return res.status(200).json({ success: true, data: user });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}

// Users handlers
async function handleUsers(req, res, path) {
  if (path === '/users/active' && req.method === 'GET') {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await prisma.user.findMany({
      where: {
        isOnline: true,
        lastActive: { gte: fiveMinutesAgo },
        currentLat: { not: null },
        currentLng: { not: null }
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
      orderBy: { lastActive: 'desc' }
    });

    return res.status(200).json({
      users: activeUsers,
      count: activeUsers.length,
      timestamp: new Date().toISOString()
    });
  }

  if (path === '/users/heartbeat' && req.method === 'POST') {
    const { anonymousId, lat, lng, isTracking } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'anonymousId é obrigatório' });
    }

    const user = await prisma.user.upsert({
      where: { anonymousId },
      update: {
        isOnline: true,
        currentLat: lat || undefined,
        currentLng: lng || undefined,
        isTracking: isTracking !== undefined ? isTracking : undefined,
        lastActive: new Date()
      },
      create: {
        anonymousId,
        isOnline: true,
        currentLat: lat || null,
        currentLng: lng || null,
        isTracking: isTracking || false,
        lastActive: new Date(),
        acceptedTerms: true,
        acceptedTermsDate: new Date()
      }
    });

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
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}

// WiFi handlers
async function handleWifi(req, res, path) {
  if (path === '/wifi/identify' && req.method === 'POST') {
    const { ssid, bssid } = req.body;

    if (!ssid && !bssid) {
      return res.status(400).json({ error: 'SSID ou BSSID é obrigatório' });
    }

    const wifi = await prisma.wifiNetwork.findFirst({
      where: {
        OR: [
          { ssid: ssid || undefined },
          { bssid: bssid || undefined }
        ],
        active: true
      },
      include: {
        line: true
      }
    });

    if (!wifi) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wi-Fi não identificado' 
      });
    }

    return res.status(200).json({
      success: true,
      line: {
        id: wifi.line.id,
        code: wifi.line.code,
        name: wifi.line.name,
        colorHex: wifi.line.colorHex
      }
    });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
