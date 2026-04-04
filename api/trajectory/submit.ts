/**
 * API Endpoint: POST /api/trajectory/submit
 * 
 * Recebe contribuição de rota de usuário e armazena como Trajectory
 * com trust score calculado.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TrajectorySubmission {
  userId: string;
  lineId: string;
  direction?: string;
  points: Array<{
    lat: number;
    lng: number;
    speed?: number;
    timestamp: number;
    accuracy?: number;
  }>;
  validationMeta?: {
    clientConfidence: number;
    estimatedStops: number;
    reasons: string[];
    avgSpeed: number;
    maxSpeed: number;
    distance: number;
    duration: number;
    wifiValidated?: boolean;
    wifiBSSID?: string;
    wifiSSID?: string;
  };
}

/**
 * Calcula trust score inicial
 */
function calculateInitialTrust(
  clientConfidence: number,
  wifiValidated: boolean,
  userTrustScore: number
): number {
  let score = clientConfidence;
  
  if (wifiValidated) {
    score += 0.3;
  }
  
  score += userTrustScore * 0.2;
  
  return Math.max(0.1, Math.min(1.0, score));
}

/**
 * Calcula pontos baseado no trust score
 */
function calculatePoints(trustScore: number): number {
  const basePoints = 50;
  
  // Pending: 25% dos pontos
  const multiplier = 0.25;
  
  // Bônus para trust score alto
  const bonus = trustScore >= 0.8 ? 1.2 : 1.0;
  
  return Math.round(basePoints * multiplier * bonus);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const submission: TrajectorySubmission = req.body;

    // Validações básicas
    if (!submission.userId || !submission.lineId || !submission.points || submission.points.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos: userId, lineId e points são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: submission.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Buscar linha
    const line = await prisma.line.findUnique({
      where: { id: submission.lineId }
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        error: 'Linha não encontrada'
      });
    }

    // Calcular trust score
    const clientConfidence = submission.validationMeta?.clientConfidence ?? 0.5;
    const wifiValidated = submission.validationMeta?.wifiValidated ?? false;
    const userTrustScore = user.trustScore;

    const trustScore = calculateInitialTrust(
      clientConfidence,
      wifiValidated,
      userTrustScore
    );

    // Criar trajetória
    const trajectory = await prisma.trajectory.create({
      data: {
        userId: user.id,
        lineId: line.id,
        direction: submission.direction || 'ida',
        status: 'pending',
        trustScore,
        points: submission.points,
        metadata: {
          ...submission.validationMeta,
          deviceType: req.headers['user-agent'] || 'unknown',
          submittedAt: new Date().toISOString()
        }
      }
    });

    // Atualizar contador de contribuições do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        contributions: { increment: 1 },
        // Pequeno aumento no trust score por contribuir
        trustScore: Math.min(1.0, user.trustScore + 0.02)
      }
    });

    // Calcular pontos ganhos
    const pointsEarned = calculatePoints(trustScore);

    // Atualizar pontos do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: pointsEarned },
        totalPoints: { increment: pointsEarned }
      }
    });

    // Resposta de sucesso
    return res.status(201).json({
      success: true,
      data: {
        trajectoryId: trajectory.id,
        status: trajectory.status,
        trustScore: trajectory.trustScore,
        pointsEarned,
        message: trustScore >= 0.7
          ? 'Contribuição recebida com alta confiança! Será processada em breve.'
          : 'Contribuição recebida! Passará por validação adicional.'
      }
    });

  } catch (error) {
    console.error('[API] Erro ao salvar trajetória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await prisma.$disconnect();
  }
}
