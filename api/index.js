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

    // Routing endpoints
    if (path.startsWith('/routing')) {
      return await handleRouting(req, res, path);
    }

    // Endpoint /version removido para simplificar e ler o estático de public/version.json

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

  if (path === '/wifi/validate-by-trajeto' && req.method === 'POST') {
    const { lineId, points } = req.body;

    if (!lineId || !points || !Array.isArray(points) || points.length < 3) {
      return res.status(400).json({ 
        success: false, 
        error: 'lineId e pelo menos 3 pontos são obrigatórios' 
      });
    }

    try {
      // Buscar rota da linha
      const linha = await prisma.line.findUnique({
        where: { id: lineId },
        include: {
          routes: {
            where: { active: true },
            include: {
              points: {
                orderBy: { sequence: 'asc' },
                select: { lat: true, lng: true }
              }
            }
          }
        }
      });

      if (!linha || !linha.routes || linha.routes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Rota da linha não encontrada' 
        });
      }

      // Usar apenas a primeira rota (ida)
      const rota = linha.routes[0];
      const pontosRota = rota.points;

      if (pontosRota.length < 2) {
        return res.status(400).json({ 
          success: false, 
          error: 'Rota com pontos insuficientes' 
        });
      }

      // Calcular distância média entre pontos do trajeto do usuário e a rota
      let distanciaTotal = 0;
      let pontosValidos = 0;

      for (const pontoUser of points) {
        let menorDistancia = Infinity;

        for (const pontoRota of pontosRota) {
          const latDiff = pontoUser.lat - pontoRota.lat;
          const lngDiff = pontoUser.lng - pontoRota.lng;
          const distancia = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // em metros

          if (distancia < menorDistancia) {
            menorDistancia = distancia;
          }
        }

        // Considerar apenas pontos que estão dentro de 200m da rota
        if (menorDistancia <= 200) {
          distanciaTotal += menorDistancia;
          pontosValidos++;
        }
      }

      // Calcular confiança baseada na proximidade média
      const confianca = pontosValidos > 0 
        ? Math.max(0, 1 - (distanciaTotal / pontosValidos / 200)) 
        : 0;

      // Verificar se o trajeto tem consistência (variação de velocidade razoável)
      let velocidadesValidas = 0;
      let velocidadesTotais = 0;

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        
        const latDiff = p2.lat - p1.lat;
        const lngDiff = p2.lng - p1.lng;
        const distancia = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;

        // Se tiver timestamp, calcular velocidade
        if (p1.timestamp && p2.timestamp) {
          const tempoSegundos = (p2.timestamp - p1.timestamp) / 1000;
          if (tempoSegundos > 0) {
            const velocidadeMs = distancia / tempoSegundos;
            const velocidadeKmh = velocidadeMs * 3.6;

            // Velocidade entre 5 e 80 km/h é razoável para ônibus
            if (velocidadeKmh >= 5 && velocidadeKmh <= 80) {
              velocidadesValidas++;
            }
            velocidadesTotais++;
          }
        }
      }

      // Aumentar confiança se velocidades forem consistentes
      const confiancaFinal = velocidadesTotais > 0
        ? confianca * (0.7 + 0.3 * (velocidadesValidas / velocidadesTotais))
        : confianca;

      return res.status(200).json({
        success: true,
        validated: confiancaFinal >= 0.5,
        confianca: Math.round(confiancaFinal * 100),
        pontosValidos,
        totalPontos: points.length,
        distanciaMediaMetros: pontosValidos > 0 ? Math.round(distanciaTotal / pontosValidos) : 0,
        velocidadesConsistentes: velocidadesValidas > velocidadesTotais * 0.5
      });
    } catch (error) {
      console.error('Erro na validação por trajeto:', error);
      return res.status(500).json({ error: 'Erro ao validar trajeto' });
    }
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

// Routing handlers
async function handleRouting(req, res, path) {
  if (path === '/routing/search' && req.method === 'GET') {
    const { origLat, origLng, destLat, destLng, radius = 1000 } = req.query;

    if (!origLat || !origLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Faltam coordenadas' });
    }

    const oLat = parseFloat(origLat);
    const oLng = parseFloat(origLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);
    const r = parseFloat(radius);

    try {
      // Pega dicionario de linhas que tem paradas proximas da origem
      const originStops = await prisma.$queryRaw`
        SELECT DISTINCT "lineId"
        FROM stops
        WHERE ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${oLng}, ${oLat})::geography,
          ${r}
        ) AND active = true
      `;
      
      const originLineIds = originStops.map(s => s.lineId);
      
      if (originLineIds.length === 0) {
        return res.status(200).json({ success: true, routes: [], message: 'Não há paradas perto da origem.' });
      }

      // Procura quais dessas linhas tb tem parada proximo ao destino
      const lineIdsString = originLineIds.join("','");
      // Precisa fazer raw query compativel, ou chamar o prisma para a interseção
      
      const destinationStops = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT "lineId"
        FROM stops
        WHERE "lineId" IN ('${originLineIds.join("','")}') 
        AND ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${dLng}, ${dLat})::geography,
          ${r}
        ) AND active = true
      `);

      const validLineIds = destinationStops.map(s => s.lineId);

      if (validLineIds.length === 0) {
        return res.status(200).json({ success: true, routes: [], message: 'Nenhuma viagem direta encontrada.' });
      }

      // Busca dados completos das linhas validas
      const lines = await prisma.line.findMany({
        where: {
          id: { in: validLineIds },
          active: true
        }
      });

      return res.status(200).json({ success: true, routes: lines });

    } catch (error) {
      console.error('Routing db erro:', error);
      return res.status(500).json({ error: 'Erro no servidor' });
    }

  }
  
  // Endpoint para download do APK
  if (path === '/apk/download' && req.method === 'GET') {
    const apkPath = '/app/TarifaZero-2.5.0.3.apk';
    
    try {
      // Verificar se o arquivo existe
      const fs = require('fs');
      const path = require('path');
      
      const apkFile = path.join(process.cwd(), apkPath);
      
      if (!fs.existsSync(apkFile)) {
        return res.status(404).json({ error: 'APK não encontrado' });
      }
      
      // Enviar o arquivo
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="TarifaZero-2.5.0.3.apk"');
      res.setHeader('Content-Length', fs.statSync(apkFile).size);
      
      return res.sendFile(apkFile);
    } catch (error) {
      console.error('Erro ao baixar APK:', error);
      return res.status(500).json({ error: 'Erro ao baixar APK' });
    }
  }
  
  return res.status(404).json({ error: 'Endpoint not found' });
}
