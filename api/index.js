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

    // Supporters endpoints
    if (path.startsWith('/supporters')) {
      return await handleSupporters(req, res, path);
    }

    // Version check endpoint
    if (path === '/version' && req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: {
          version: "2.1.0",
          versionCode: 2,
          releaseDate: "2026-03-30",
          downloadUrl: "https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.1.0/TarifaZero.apk",
          changelog: [
            "✅ Suporte completo para Android 13+",
            "✅ Sistema de contribuidores com doações Pix",
            "✅ Melhorias no WiFi Scanner",
            "✅ Página Sobre com perfil e apoiadores",
            "✅ Correções de bugs e melhorias de performance"
          ],
          minVersion: "2.0.0",
          forceUpdate: false
        }
      });
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
  // POST /stops/mark
  if (path === '/stops/mark' && req.method === 'POST') {
    const { lineId, lat, lng, sessionId, name } = req.body;
    
    if (!lineId || !lat || !lng) {
      return res.status(400).json({ error: 'lineId, lat e lng são obrigatórios' });
    }

    try {
      // Criar parada temporária (será processada depois)
      const stop = await prisma.tempStop.create({
        data: {
          lineId,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          sessionId: sessionId || null,
          name: name || null,
          createdAt: new Date()
        }
      });

      return res.status(200).json({ 
        success: true,
        stop: {
          id: stop.id,
          lat: stop.lat,
          lng: stop.lng,
          name: stop.name
        }
      });
    } catch (error) {
      console.error('Erro ao marcar parada:', error);
      return res.status(500).json({ error: 'Erro ao marcar parada' });
    }
  }

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
  if (path === '/users/create' && req.method === 'POST') {
    const { anonymousId, nickname, acceptedTerms, acceptedTermsDate } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'anonymousId é obrigatório' });
    }

    const user = await prisma.user.upsert({
      where: { anonymousId },
      update: {
        nickname: nickname || undefined,
        acceptedTerms: acceptedTerms || undefined,
        acceptedTermsDate: acceptedTermsDate ? new Date(acceptedTermsDate) : undefined
      },
      create: {
        anonymousId,
        nickname: nickname || null,
        acceptedTerms: acceptedTerms || true,
        acceptedTermsDate: acceptedTermsDate ? new Date(acceptedTermsDate) : new Date(),
        isOnline: false,
        points: 0,
        level: 1,
        totalTrips: 0
      }
    });

    return res.status(200).json({
      success: true,
      user: {
        anonymousId: user.anonymousId,
        nickname: user.nickname,
        level: user.level,
        points: user.points
      }
    });
  }

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
  if (path === '/wifi/save' && req.method === 'POST') {
    const { ssid, bssid, lineId } = req.body;

    if (!bssid || !lineId) {
      return res.status(400).json({ error: 'BSSID e lineId são obrigatórios' });
    }

    try {
      const wifi = await prisma.wifiNetwork.upsert({
        where: { bssid },
        update: {
          ssid: ssid || undefined,
          lineId,
          active: true
        },
        create: {
          ssid: ssid || null,
          bssid,
          lineId,
          active: true
        }
      });

      return res.status(200).json({
        success: true,
        wifi: {
          id: wifi.id,
          ssid: wifi.ssid,
          bssid: wifi.bssid
        }
      });
    } catch (error) {
      console.error('Erro ao salvar WiFi:', error);
      return res.status(500).json({ error: 'Erro ao salvar WiFi' });
    }
  }

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

// Supporters handlers
async function handleSupporters(req, res, path) {
  // GET /supporters - lista todos os apoiadores ativos
  if (path === '/supporters' && req.method === 'GET') {
    const supporters = await prisma.supporter.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, socialUrl: true, socialLabel: true, avatarUrl: true }
    });
    return res.status(200).json({ success: true, data: supporters });
  }

  // POST /supporters - adiciona um apoiador (uso interno/admin)
  if (path === '/supporters' && req.method === 'POST') {
    const { name, socialUrl, socialLabel, avatarUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'name é obrigatório' });

    const supporter = await prisma.supporter.create({
      data: { name, socialUrl, socialLabel, avatarUrl }
    });
    return res.status(201).json({ success: true, data: supporter });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
