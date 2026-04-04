# 🛡️ Especificação: Validação em Camadas para Rotas Colaborativas (TarifaZero)

## 🎯 Contexto & Objetivo
O projeto **TarifaZero** permite que usuários contribuam com rotas de ônibus via GPS. O sistema atual depende de validação por Wi-Fi, mas permite fallback para "apenas GPS". Isso cria risco de usuários em carros gerarem trajetórias inválidas.  
**Objetivo:** Implementar uma arquitetura de validação em camadas que:
1. Filtre padrões de movimento incompatíveis com ônibus no cliente
2. Armazene contribuições com níveis de confiança (`trust_score`)
3. Só promova rotas para `verified` quando houver consenso espacial entre múltiplos usuários
4. Rejeite ou sinalize como `low_confidence` trajetórias atípicas

> ⚠️ **Princípio fundamental:** Nenhum sistema crowdsourced confia em indivíduos. Confiança emerge de redundância + estatística.

---

## 🧱 Arquitetura de Validação em 4 Camadas

| Camada | Responsabilidade | Threshold/Regra |
|--------|------------------|-----------------|
| `1. Client-Side` | Pré-filtro de padrão de movimento | Vel. média 12–50 km/h, ≥3 paradas, sem zigue-zague |
| `2. Trust Score` | Ponderação por método + histórico | Wi-Fi=1.0, GPS+padrão=0.6, GPS+atípico=0.3 |
| `3. Consenso Espacial` | Clustering de trajetórias independentes | ≥3 usuários, similaridade >85% (Hausdorff/DTW) |
| `4. Restrições de Rede` | Validação contra mapa viário | >60% em vias primárias/secundárias, sem curvas <30° |

---

## 📱 1. Validação Client-Side (Frontend)

**Arquivo:** `src/lib/trackValidator.ts`
```ts
export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number; // m/s
  accuracy?: number;
}

export interface TrackValidationResult {
  isValid: boolean;
  confidence: number; // 0.0 - 1.0
  reasons: string[];
  estimatedStops: number;
}

export const validateBusPattern = (track: GPSPoint[]): TrackValidationResult => {
  if (track.length < 10) {
    return { isValid: false, confidence: 0, reasons: ['Trajetória muito curta'], estimatedStops: 0 };
  }

  // 1. Calcular velocidades médias e máximas (converter m/s → km/h)
  const speedsKmh = track
    .filter(p => p.speed != null && p.speed > 0)
    .map(p => p.speed * 3.6);
  
  const avgSpeed = speedsKmh.length > 0 
    ? speedsKmh.reduce((a, b) => a + b, 0) / speedsKmh.length 
    : 0;
  const maxSpeed = Math.max(0, ...speedsKmh);

  // 2. Detectar paradas (velocidade < 1.4 m/s por ≥20s em raio ≤50m)
  let stops = 0;
  let stopWindow: GPSPoint[] = [];
  for (let i = 0; i < track.length; i++) {
    if (track[i].speed != null && track[i].speed < 1.4) {
      stopWindow.push(track[i]);
      const duration = (stopWindow[stopWindow.length - 1].timestamp - stopWindow[0].timestamp) / 1000;
      if (duration >= 20) {
        stops++;
        stopWindow = [track[i]];
      }
    } else {
      stopWindow = [];
    }
  }

  // 3. Regras de validação
  const reasons: string[] = [];
  if (avgSpeed > 55) reasons.push('Velocidade média alta (padrão carro)');
  if (avgSpeed < 8 && track.length > 30) reasons.push('Velocidade muito baixa (trânsito/a pé)');
  if (stops < 3 && track.length > 50) reasons.push('Poucas paradas detectadas para trajeto longo');
  if (maxSpeed > 80) reasons.push('Pico de velocidade incompatível com ônibus urbano');

  const isValid = reasons.length === 0;
  const confidence = isValid ? 0.85 : Math.max(0.3, 1 - (reasons.length * 0.25));

  return { isValid, confidence, reasons, estimatedStops: stops };
};

Uso no Contribuir.tsx (antes do upload):
import { validateBusPattern } from '@/lib/trackValidator';

const finishRecording = async () => {
  const validation = validateBusPattern(recordedTrack);
  
  if (!validation.isValid) {
    const confirm = await confirmDialog({
      title: 'Padrão incomum detectado',
      message: `Motivos: ${validation.reasons.join(', ')}. Enviar mesmo assim?`,
      confirmText: 'Sim, enviar',
      cancelText: 'Cancelar'
    });
    if (!confirm) return;
  }

  await submitTrack({
    track: recordedTrack,
    lineId: selectedLineId,
    validationMeta: {
      clientConfidence: validation.confidence,
      estimatedStops: validation.estimatedStops,
      reasons: validation.reasons
    }
  });
};

☁️ 2. Backend: Schema & Endpoint de Recepção
Arquivo: prisma/schema.prisma

enum TrackStatus { pending | draft | verified | rejected }

model User {
  id            String   @id @default(cuid())
  trustScore    Float    @default(0.5)
  contributions Int      @default(0)
  createdAt     DateTime @default(now())
}

model Trajectory {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  lineId          String
  direction       String      @default("ida") // ida | volta
  status          TrackStatus @default(pending)
  trustScore      Float       @default(0.5)
  points          Json        // Array de {lat, lng, speed, ts, accuracy}
  metadata        Json?       // {clientConfidence, reasons, estimatedStops, deviceType}
  createdAt       DateTime    @default(now())
  verifiedAt      DateTime?
}

Arquivo: src/routes/trajectory.ts (Express/Node)
import { Router, Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { validateBusPattern } from '@/lib/trackValidator'; // reutilizar lógica se quiser validação extra no server

const router = Router();

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { track, lineId, direction, validationMeta, userId } = req.body;

    // 1. Calcular trust_score inicial
    const baseScore = validationMeta?.clientConfidence ?? 0.5;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const finalTrust = Math.min(1.0, baseScore + (user?.trustScore ?? 0.5) * 0.2);

    // 2. Salvar como pending
    const trajectory = await prisma.trajectory.create({
      data: {
        userId,
        lineId,
        direction,
        status: 'pending',
        trustScore: finalTrust,
        points: track,
        metadata: validationMeta || {}
      }
    });

    // 3. Trigger async clustering (fila ou webhook)
    // await queue.add('cluster-routes', { trajectoryId: trajectory.id });

    res.status(201).json({ success: true, trajectoryId: trajectory.id, trustScore: finalTrust });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao salvar trajetória' });
  }
});

export default router;

🗺️ 3. Consenso Espacial & Clustering (Backend Async)
Arquivo: src/services/clusterRoutes.ts

import * as turf from '@turf/turf';

export interface ClusterResult {
  routeId: string;
  trajectoryIds: string[];
  avgTrust: number;
  similarity: number;
  status: 'draft' | 'verified';
}

export const runSpatialClustering = async (lineId: string) => {
  const pending = await prisma.trajectory.findMany({
    where: { lineId, status: 'pending' },
    include: { user: true }
  });

  if (pending.length < 3) return; // Mínimo para consenso

  // Converter para GeoJSON LineStrings
  const lineStrings = pending.map(t => 
    turf.lineString(t.points as turf.Position[])
  );

  // Cluster DBSCAN espacial (eps ~0.0005 ≈ 50m, minSamples: 3)
  const clusters: ClusterResult[] = [];
  const visited = new Set<number>();

  for (let i = 0; i < lineStrings.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [i];
    visited.add(i);

    for (let j = i + 1; j < lineStrings.length; j++) {
      if (visited.has(j)) continue;
      const hausdorff = turf.distance(lineStrings[i], lineStrings[j], { units: 'kilometers' });
      // Simplificação: usar distância média entre centroides + overlay de paradas
      if (hausdorff < 0.8) { // 800m de tolerância para rotas urbanas
        cluster.push(j);
        visited.add(j);
      }
    }

    if (cluster.length >= 3) {
      const avgTrust = cluster.reduce((sum, idx) => sum + pending[idx].trustScore, 0) / cluster.length;
      clusters.push({
        routeId: `route_${lineId}_${cluster.length}_${Date.now()}`,
        trajectoryIds: cluster.map(idx => pending[idx].id),
        avgTrust,
        similarity: 1 - (hausdorff / 2), // Normalizado
        status: avgTrust >= 0.75 ? 'verified' : 'draft'
      });
    }
  }

  // Atualizar status no DB
  for (const c of clusters) {
    await prisma.trajectory.updateMany({
      where: { id: { in: c.trajectoryIds } },
      data: { status: c.status, verifiedAt: new Date() }
    });
  }

  return clusters;
};

📌 Nota: Para produção, substitua a heurística simples por scipy.spatial.distance + sklearn.cluster.DBSCAN em Python, ou use @turf/turf com turf.clusterDbscan() + turf.lineOverlap().


📊 4. Sistema de Trust Score Progressivo
Arquivo: src/services/reputation.ts

export const updateUserTrust = async (userId: string, trajectoryStatus: 'verified' | 'rejected' | 'draft') => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  let delta = 0;
  if (trajectoryStatus === 'verified') delta += 0.15;
  else if (trajectoryStatus === 'rejected') delta -= 0.10;
  else delta += 0.05; // draft contribui levemente

  const newScore = Math.max(0.1, Math.min(1.0, user.trustScore + delta));
  await prisma.user.update({
    where: { id: userId },
    data: { 
      trustScore: newScore,
      contributions: { increment: 1 }
    }
  });
};

Chamar após clustering:
// Dentro de runSpatialClustering, após updateMany:
for (const trajId of c.trajectoryIds) {
  const traj = await prisma.trajectory.findUnique({ where: { id: trajId } });
  await updateUserTrust(traj.userId, c.status);
}

🔄 5. Fluxo Completo & Estados de Rota
Usuário grava → validateBusPattern() → trust_score inicial
   ↓
Backend salva como `status: pending`
   ↓
Worker executa clustering espacial por linha/direção
   ↓
≥3 traj. similares + avgTrust ≥ 0.75? → `verified`
   ↓ Não
  ≥3 traj. similares + avgTrust < 0.75? → `draft` (visível apenas em modo teste)
   ↓
Usuário contribuiu? → Atualizar `user.trustScore`
   ↓
App consulta: GET /api/lines/:id/routes → filtra por status

Exemplo de resposta da API de rotas:
{
  "routeId": "route_12_verified",
  "status": "verified",
  "confidence": "high",
  "contributors": 4,
  "avgTrust": 0.82,
  "points": [...],
  "lastUpdated": "2026-04-05T14:30:00Z"
}

🛠️ Instruções de Implementação para Agente IA
Instalar dependências:
comando bash mas corrija se for para poweshell
npm install @turf/turf
# ou yarn add @turf/turf

Criar arquivos na ordem:
src/lib/trackValidator.ts → colar código validador
Atualizar Contribuir.tsx → adicionar chamada validateBusPattern antes do upload
Atualizar prisma/schema.prisma → adicionar modelos User e Trajectory
Rodar npx prisma migrate dev --name add_routing_validation
Criar src/routes/trajectory.ts → endpoint /submit
Criar src/services/clusterRoutes.ts → lógica de clustering
Criar src/services/reputation.ts → atualização de trust_score
Configurar fila/worker (opcional mas recomendado):
Usar bullmq ou node-cron para chamar runSpatialClustering() a cada 10 min
Ex: src/workers/trajectoryCluster.worker.ts
Ajustar UI para mostrar status:
Rotas verified → badge verde ✅ "Verificada por X usuários"
Rotas draft → badge amarelo 🟡 "Em análise (X contribuições)"
Rotas pending → ocultas do público, visíveis apenas no painel admin
Testes mínimos:
Enviar trajetória curta → deve rejeitar ou pedir confirmação
Enviar 3 trajetórias similares com trust > 0.8 → deve virar verified
Enviar trajetória rápida/sem paradas → trust < 0.5, status pending
Verificar user.trustScore atualizando após clustering
✅ Critérios de Aceite (Definition of Done)
Validação client-side impede uploads acidentais de padrões não-ônibus sem aviso
Backend armazena trust_score e status por trajetória
Clustering agrupa por linha + direção + similaridade espacial
≥3 contribuições independentes → promoção automática para verified ou draft
user.trustScore é atualizado dinamicamente com limites [0.1, 1.0]
API de rotas filtra/exibe status de forma clara para o usuário final
Fallback graceful: se clustering falhar, trajetória permanece pending sem crash
Documentação inline nos arquivos criados
🔑 Lembrete para o agente: Não remova a lógica existente de Wi-Fi. Esta arquitetura é complementar. O Wi-Fi apenas acelera a confiança inicial (trust_score += 0.3), mas o consenso espacial é a fonte de verdade.


