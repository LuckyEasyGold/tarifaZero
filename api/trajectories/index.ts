import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware para obter ID do usuário (em produção, viria do token)
const getUserId = (req: any) => {
  return req.headers['x-user-id'] || 'anonymous-user';
};

/**
 * POST /api/trajectories/start
 * Inicia uma nova sessão de gravação de trajeto
 */
router.post('/start', async (req, res) => {
  try {
    const { lineId } = req.body;
    const userId = getUserId(req);

    if (!lineId) {
      return res.status(400).json({ success: false, error: 'lineId é obrigatório' });
    }

    // Verificar se linha existe
    const line = await prisma.line.findUnique({
      where: { id: lineId },
    });

    if (!line) {
      return res.status(404).json({ success: false, error: 'Linha não encontrada' });
    }

    // Criar sessão de trajeto
    const sessionId = `traj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const trajectory = await prisma.userTrajectory.create({
      data: {
        userId,
        lineId,
        sessionId,
        status: 'pending',
        points: [],
        stops: [],
        metadata: {
          deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
          startedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`[TRAJECTORY] Sessão iniciada: ${sessionId} para linha ${lineId}`);

    res.json({
      success: true,
      data: {
        sessionId,
        trajectoryId: trajectory.id,
        startTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[TRAJECTORY] Erro ao iniciar sessão:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/trajectories/point
 * Adiciona um ponto GPS ao trajeto sendo gravado
 */
router.post('/point', async (req, res) => {
  try {
    const { sessionId, lat, lng, speed, accuracy, heading } = req.body;
    const userId = getUserId(req);

    if (!sessionId || !lat || !lng) {
      return res.status(400).json({ success: false, error: 'Dados incompletos' });
    }

    // Buscar trajeto
    const trajectory = await prisma.userTrajectory.findFirst({
      where: { sessionId },
    });

    if (!trajectory) {
      return res.status(404).json({ success: false, error: 'Sessão não encontrada' });
    }

    // Adicionar ponto
    const currentPoints = trajectory.points as any[];
    const newPoint = {
      lat,
      lng,
      speed: speed || null,
      accuracy: accuracy || null,
      heading: heading || null,
      ts: Date.now(),
    };

    const updatedPoints = [...currentPoints, newPoint];

    await prisma.userTrajectory.update({
      where: { id: trajectory.id },
      data: {
        points: updatedPoints,
        updatedAt: new Date(),
      },
    });

    // Também salvar em UserTrack para histórico detalhado
    await prisma.userTrack.create({
      data: {
        userId,
        sessionId,
        lineId: trajectory.lineId,
        lat,
        lng,
        speed: speed || null,
        heading: heading || null,
        accuracy: accuracy || null,
        timestamp: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        pointsCount: updatedPoints.length,
      },
    });
  } catch (error) {
    console.error('[TRAJECTORY] Erro ao adicionar ponto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/trajectories/stop
 * Finaliza a gravação do trajeto
 */
router.post('/stop', async (req, res) => {
  try {
    const { sessionId, metadata } = req.body;
    const userId = getUserId(req);

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId é obrigatório' });
    }

    // Buscar trajeto
    const trajectory = await prisma.userTrajectory.findFirst({
      where: { sessionId },
    });

    if (!trajectory) {
      return res.status(404).json({ success: false, error: 'Sessão não encontrada' });
    }

    const currentPoints = trajectory.points as any[];

    // Atualizar com metadados finais
    await prisma.userTrajectory.update({
      where: { id: trajectory.id },
      data: {
        metadata: {
          ...trajectory.metadata,
          ...metadata,
          endedAt: new Date().toISOString(),
          pointsCount: currentPoints.length,
        },
      },
    });

    // Calcular estatísticas básicas
    let distance = 0;
    let avgSpeed = 0;
    let maxSpeed = 0;

    if (currentPoints.length > 1) {
      // Calcular distância total
      for (let i = 1; i < currentPoints.length; i++) {
        const p1 = currentPoints[i - 1];
        const p2 = currentPoints[i];
        const dLat = (p2.lat - p1.lat) * 111000;
        const dLng = (p2.lng - p1.lng) * 111000 * Math.cos(p1.lat * Math.PI / 180);
        distance += Math.sqrt(dLat * dLat + dLng * dLng);
      }

      // Calcular velocidades
      const speeds = currentPoints.filter(p => p.speed).map(p => p.speed);
      if (speeds.length > 0) {
        avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        maxSpeed = Math.max(...speeds);
      }
    }

    console.log(`[TRAJECTORY] Sessão finalizada: ${sessionId}, pontos: ${currentPoints.length}, distância: ${(distance / 1000).toFixed(2)}km`);

    res.json({
      success: true,
      data: {
        trajectoryId: trajectory.id,
        pointsCount: currentPoints.length,
        distance: distance.toFixed(2),
        avgSpeed: avgSpeed.toFixed(2),
        maxSpeed: maxSpeed.toFixed(2),
        message: 'Trajeto salvo com sucesso! Aguardando validação.',
      },
    });
  } catch (error) {
    console.error('[TRAJECTORY] Erro ao finalizar sessão:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/trajectories/stop-mark
 * Marca uma parada durante a gravação
 */
router.post('/stop-mark', async (req, res) => {
  try {
    const { sessionId, lat, lng, name } = req.body;
    const userId = getUserId(req);

    if (!sessionId || !lat || !lng || !name) {
      return res.status(400).json({ success: false, error: 'Dados incompletos' });
    }

    // Buscar trajeto
    const trajectory = await prisma.userTrajectory.findFirst({
      where: { sessionId },
    });

    if (!trajectory) {
      return res.status(404).json({ success: false, error: 'Sessão não encontrada' });
    }

    // Criar parada do usuário
    await prisma.userStop.create({
      data: {
        userId,
        lineId: trajectory.lineId,
        trajectoryId: trajectory.id,
        lat,
        lng,
        name,
        status: 'pending',
        metadata: {
          createdAt: new Date().toISOString(),
          source: 'user_recording',
        },
      },
    });

    // Atualizar trajeto com a parada
    const currentStops = (trajectory.stops as any[]) || [];
    const newStop = {
      lat,
      lng,
      name,
      ts: Date.now(),
    };

    await prisma.userTrajectory.update({
      where: { id: trajectory.id },
      data: {
        stops: [...currentStops, newStop],
      },
    });

    console.log(`[STOP] Parada marcada: ${name} na linha ${trajectory.lineId}`);

    res.json({
      success: true,
      data: {
        message: `Parada "${name}" marcada com sucesso!`,
      },
    });
  } catch (error) {
    console.error('[STOP] Erro ao marcar parada:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/trajectories/:lineId/route
 * Retorna a rota oficial e trajetos pendentes de uma linha
 */
router.get('/:lineId/route', async (req, res) => {
  try {
    const { lineId } = req.params;

    // Buscar rota oficial
    const officialRoute = await prisma.route.findFirst({
      where: { lineId, active: true },
      include: {
        points: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    // Buscar paradas oficiais
    const officialStops = await prisma.stop.findMany({
      where: { lineId, active: true },
    });

    res.json({
      success: true,
      data: {
        officialRoute: officialRoute ? {
          id: officialRoute.id,
          direction: officialRoute.direction,
          points: officialRoute.points.map(p => ({
            lat: p.lat,
            lng: p.lng,
            sequence: p.sequence,
          })),
        } : null,
        officialStops: officialStops.map(s => ({
          id: s.id,
          name: s.name,
          lat: s.lat,
          lng: s.lng,
        })),
      },
    });
  } catch (error) {
    console.error('[TRAJECTORY] Erro ao buscar rota:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;
