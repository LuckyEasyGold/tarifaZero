/**
 * Serviço de Clustering Espacial de Trajetórias
 * 
 * Agrupa trajetórias similares e promove para 'verified' quando
 * houver consenso entre múltiplos usuários (≥3).
 */

import * as turf from '@turf/turf';
import { PrismaClient } from '@prisma/client';
import { updateUserTrust } from './reputation';

const prisma = new PrismaClient();

export interface ClusterResult {
  routeId: string;
  trajectoryIds: string[];
  avgTrust: number;
  similarity: number;
  status: 'draft' | 'verified';
  lineId: string;
  direction: string;
  contributors: number;
}

/**
 * Executa clustering espacial para uma linha específica
 */
export async function runSpatialClustering(
  lineId: string,
  direction?: 'ida' | 'volta'
): Promise<ClusterResult[]> {
  console.log(`[Clustering] 🔄 Iniciando para linha ${lineId}${direction ? ` (${direction})` : ''}`);

  // Buscar trajetórias pendentes
  const pending = await prisma.trajectory.findMany({
    where: {
      lineId,
      direction: direction || undefined,
      status: 'pending'
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (pending.length < 3) {
    console.log(`[Clustering] ⏸️  Apenas ${pending.length} trajetórias pendentes (mínimo: 3)`);
    return [];
  }

  console.log(`[Clustering] 📊 Processando ${pending.length} trajetórias`);

  // Converter trajetórias para LineStrings do Turf
  const lineStrings = pending.map(t => {
    const points = t.points as any[];
    const coords = points.map((p: any) => [p.lng, p.lat] as [number, number]);
    return turf.lineString(coords);
  });

  const results: ClusterResult[] = [];
  const visited = new Set<number>();

  // Algoritmo de clustering baseado em distância
  for (let i = 0; i < lineStrings.length; i++) {
    if (visited.has(i)) continue;

    const cluster: number[] = [i];
    visited.add(i);

    // Encontrar trajetórias similares
    for (let j = i + 1; j < lineStrings.length; j++) {
      if (visited.has(j)) continue;

      // Calcular distância entre centroides
      const centroidI = turf.centroid(lineStrings[i]);
      const centroidJ = turf.centroid(lineStrings[j]);
      const distance = turf.distance(centroidI, centroidJ, { units: 'kilometers' });

      // Se distância < 800m, considerar similar
      if (distance < 0.8) {
        cluster.push(j);
        visited.add(j);
      }
    }

    // Processar cluster se tiver ≥3 trajetórias
    if (cluster.length >= 3) {
      const trajectories = cluster.map(idx => pending[idx]);
      const avgTrust = trajectories.reduce((sum, t) => sum + t.trustScore, 0) / trajectories.length;
      
      // Determinar status baseado em trust score médio
      const status: 'draft' | 'verified' = avgTrust >= 0.75 ? 'verified' : 'draft';

      console.log(`[Clustering] ✅ Cluster encontrado: ${cluster.length} trajetórias, trust médio: ${avgTrust.toFixed(2)}, status: ${status}`);

      const clusterResult: ClusterResult = {
        routeId: `route_${lineId}_${direction || 'mixed'}_${Date.now()}`,
        trajectoryIds: trajectories.map(t => t.id),
        avgTrust: Math.round(avgTrust * 100) / 100,
        similarity: Math.round((1 - Math.min(distance / 2, 1)) * 100) / 100,
        status,
        lineId,
        direction: direction || 'mixed',
        contributors: cluster.length
      };

      results.push(clusterResult);

      // Atualizar status das trajetórias no banco
      await prisma.trajectory.updateMany({
        where: {
          id: { in: trajectories.map(t => t.id) }
        },
        data: {
          status,
          verifiedAt: status === 'verified' ? new Date() : null
        }
      });

      // Atualizar trust score dos usuários
      for (const trajectory of trajectories) {
        const newTrustScore = updateUserTrust(trajectory.user.trustScore, status);
        
        await prisma.user.update({
          where: { id: trajectory.userId },
          data: {
            trustScore: newTrustScore
          }
        });

        console.log(`[Clustering] 👤 Usuário ${trajectory.userId}: trust ${trajectory.user.trustScore.toFixed(2)} → ${newTrustScore.toFixed(2)}`);
      }
    }
  }

  console.log(`[Clustering] ✨ Concluído: ${results.length} clusters processados`);
  return results;
}

/**
 * Executa clustering para todas as linhas ativas
 */
export async function runClusteringAllLines(): Promise<void> {
  console.log('[Clustering] 🚀 Iniciando clustering para todas as linhas');

  try {
    const activeLines = await prisma.line.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true }
    });

    console.log(`[Clustering] 📋 ${activeLines.length} linhas ativas encontradas`);

    for (const line of activeLines) {
      try {
        console.log(`[Clustering] 🔍 Processando linha ${line.code} - ${line.name}`);
        
        // Processar ida e volta separadamente
        await runSpatialClustering(line.id, 'ida');
        await runSpatialClustering(line.id, 'volta');
        
        // Pequeno delay entre linhas
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[Clustering] ❌ Erro na linha ${line.code}:`, error);
        // Continua para próxima linha
      }
    }

    console.log('[Clustering] ✅ Clustering concluído para todas as linhas');
  } catch (error) {
    console.error('[Clustering] ❌ Erro fatal:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Processa trajetórias pendentes de uma linha específica (útil para testes)
 */
export async function processLineTrajectories(lineId: string): Promise<ClusterResult[]> {
  console.log(`[Clustering] 🎯 Processamento manual para linha ${lineId}`);
  
  const resultsIda = await runSpatialClustering(lineId, 'ida');
  const resultsVolta = await runSpatialClustering(lineId, 'volta');
  
  return [...resultsIda, ...resultsVolta];
}
