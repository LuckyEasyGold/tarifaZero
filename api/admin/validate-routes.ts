import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Compara duas trajetórias e retorna a porcentagem de similaridade
 * Usa algoritmo de distância de Hausdorff simplificado
 */
function calculateTrajectorySimilarity(points1: any[], points2: any[]): number {
  if (!points1 || !points2 || points1.length === 0 || points2.length === 0) {
    return 0;
  }

  // Calcular centroides
  const centroid1 = {
    lat: points1.reduce((sum, p) => sum + p.lat, 0) / points1.length,
    lng: points1.reduce((sum, p) => sum + p.lng, 0) / points1.length,
  };

  const centroid2 = {
    lat: points2.reduce((sum, p) => sum + p.lat, 0) / points2.length,
    lng: points2.reduce((sum, p) => sum + p.lng, 0) / points2.length,
  };

  // Distância entre centroides (em metros, aproximação)
  const distLat = (centroid2.lat - centroid1.lat) * 111000;
  const distLng = (centroid2.lng - centroid1.lng) * 111000 * Math.cos(centroid1.lat * Math.PI / 180);
  const distance = Math.sqrt(distLat * distLat + distLng * distLng);

  // Se os centroides estão muito distantes, baixa similaridade
  if (distance > 800) {
    return 0;
  }

  // Calcular similaridade baseada na sobreposição de pontos
  let matchCount = 0;
  const threshold = 50; // 50 metros de tolerância

  for (const point1 of points1) {
    for (const point2 of points2) {
      const dLat = (point2.lat - point1.lat) * 111000;
      const dLng = (point2.lng - point1.lng) * 111000 * Math.cos(point1.lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < threshold) {
        matchCount++;
        break;
      }
    }
  }

  const similarity = matchCount / Math.max(points1.length, points2.length);
  return similarity * 100; // Retorna em porcentagem
}

/**
 * Processa todas as trajetórias pendentes e verifica consenso
 * Se ≥3 trajetórias forem 90% similares, torna-se rota oficial
 */
export async function validateAndPromoteRoutes() {
  console.log('[VALIDATION] Iniciando validação de rotas colaborativas...');

  try {
    // Buscar todas as trajetórias pendentes agrupadas por linha
    const pendingTrajectories = await prisma.userTrajectory.findMany({
      where: { status: 'pending' },
      include: {
        // Incluir dados do usuário para trust score se necessário
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`[VALIDATION] Encontradas ${pendingTrajectories.length} trajetórias pendentes`);

    // Agrupar por linha
    const trajectoriesByLine = pendingTrajectories.reduce((acc, traj) => {
      if (!acc[traj.lineId]) {
        acc[traj.lineId] = [];
      }
      acc[traj.lineId].push(traj);
      return acc;
    }, {} as Record<string, typeof pendingTrajectories>);

    let promotedCount = 0;

    // Processar cada linha
    for (const [lineId, trajectories] of Object.entries(trajectoriesByLine)) {
      console.log(`[VALIDATION] Processando linha ${lineId} com ${trajectories.length} trajetórias`);

      if (trajectories.length < 3) {
        continue; // Precisa de pelo menos 3 trajetórias
      }

      // Comparar todas as combinações de trajetórias
      const clusters: Array<typeof trajectories> = [];

      for (const trajectory of trajectories) {
        const points = trajectory.points as any[];
        let foundCluster = false;

        for (const cluster of clusters) {
          // Comparar com a primeira trajetória do cluster
          const referencePoints = cluster[0].points as any[];
          const similarity = calculateTrajectorySimilarity(points, referencePoints);

          if (similarity >= 90) {
            cluster.push(trajectory);
            foundCluster = true;
            break;
          }
        }

        if (!foundCluster) {
          clusters.push([trajectory]);
        }
      }

      // Verificar se algum cluster tem ≥3 trajetórias
      for (const cluster of clusters) {
        if (cluster.length >= 3) {
          console.log(`[VALIDATION] Cluster encontrado com ${cluster.length} trajetórias similares na linha ${lineId}`);

          // Calcular trajeto médio/consenso
          const allPoints = cluster.flatMap(t => t.points as any[]);
          
          // Simplificação: usar pontos da primeira trajetória como referência
          // Em produção, deveria calcular uma média ponderada
          const consensusPoints = cluster[0].points as any[];
          const consensusStops = cluster.flatMap(t => (t.stops as any[]) || []);

          // Criar ou atualizar rota oficial
          const existingRoute = await prisma.route.findFirst({
            where: { lineId },
            include: { points: true },
          });

          if (existingRoute) {
            // Atualizar rota existente
            await prisma.$transaction(async (tx) => {
              // Deletar pontos antigos
              await tx.routePoint.deleteMany({
                where: { routeId: existingRoute.id },
              });

              // Criar novos pontos
              for (let i = 0; i < consensusPoints.length; i++) {
                const point = consensusPoints[i];
                await tx.routePoint.create({
                  data: {
                    routeId: existingRoute.id,
                    sequence: i,
                    lat: point.lat,
                    lng: point.lng,
                  },
                });
              }

              // Marcar trajetórias como verificadas
              await tx.userTrajectory.updateMany({
                where: { id: { in: cluster.map(t => t.id) } },
                data: {
                  status: 'verified',
                  verifiedAt: new Date(),
                },
              });
            });

            // Processar paradas consenso
            if (consensusStops.length > 0) {
              await processConsensusStops(lineId, consensusStops);
            }

            promotedCount++;
            console.log(`[VALIDATION] Rota oficial atualizada para linha ${lineId}`);
          } else {
            // Criar nova rota
            await prisma.$transaction(async (tx) => {
              const newRoute = await tx.route.create({
                data: {
                  lineId,
                  direction: 'ida',
                  name: `Rota Colaborativa ${new Date().toLocaleDateString()}`,
                  active: true,
                },
              });

              // Criar pontos
              for (let i = 0; i < consensusPoints.length; i++) {
                const point = consensusPoints[i];
                await tx.routePoint.create({
                  data: {
                    routeId: newRoute.id,
                    sequence: i,
                    lat: point.lat,
                    lng: point.lng,
                  },
                });
              }

              // Marcar trajetórias como verificadas
              await tx.userTrajectory.updateMany({
                where: { id: { in: cluster.map(t => t.id) } },
                data: {
                  status: 'verified',
                  verifiedAt: new Date(),
                },
              });
            });

            // Processar paradas consenso
            if (consensusStops.length > 0) {
              await processConsensusStops(lineId, consensusStops);
            }

            promotedCount++;
            console.log(`[VALIDATION] Nova rota oficial criada para linha ${lineId}`);
          }
        }
      }
    }

    console.log(`[VALIDATION] Validação concluída. ${promotedCount} rotas promovidas.`);
    return { success: true, promotedCount };
  } catch (error) {
    console.error('[VALIDATION] Erro ao validar rotas:', error);
    return { success: false, error };
  }
}

/**
 * Processa paradas consenso e cria paradas oficiais
 */
async function processConsensusStops(lineId: string, stops: any[]) {
  // Agrupar paradas por proximidade
  const stopClusters: Array<any[]> = [];

  for (const stop of stops) {
    let foundCluster = false;

    for (const cluster of stopClusters) {
      const refStop = cluster[0];
      const dLat = (stop.lat - refStop.lat) * 111000;
      const dLng = (stop.lng - refStop.lng) * 111000 * Math.cos(refStop.lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < 50) { // 50 metros de tolerância
        cluster.push(stop);
        foundCluster = true;
        break;
      }
    }

    if (!foundCluster) {
      stopClusters.push([stop]);
    }
  }

  // Criar paradas oficiais para clusters com ≥3 ocorrências
  let createdCount = 0;
  for (const cluster of stopClusters) {
    if (cluster.length >= 3) {
      const refStop = cluster[0];
      
      // Usar o nome mais comum ou o primeiro
      const stopName = refStop.name || `Parada ${createdCount + 1}`;

      await prisma.stop.create({
        data: {
          lineId,
          code: `STOP-${Date.now()}-${createdCount}`,
          name: stopName,
          lat: refStop.lat,
          lng: refStop.lng,
          description: 'Parada validada por consenso colaborativo',
          active: true,
        },
      });

      createdCount++;
    }
  }

  console.log(`[VALIDATION] ${createdCount} paradas oficiais criadas`);
}

// Export para uso como script CLI
if (require.main === module) {
  validateAndPromoteRoutes()
    .then(result => {
      console.log('Resultado:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
}
