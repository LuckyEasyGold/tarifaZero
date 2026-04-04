# 🤖 MCP Task: Validação em Camadas para Rotas Colaborativas - TarifaZero

## 📋 Resumo Executivo
Projeto: TarifaZero (https://github.com/LuckyEasyGold/tarifaZero)
Objetivo: Conectar a lógica de validação já existente (trackValidator.ts) à UI e backend para criar um fluxo completo que filtra trajetórias inválidas (ex: usuários em carros) e promove apenas rotas com consenso estatístico.
Princípio Fundamental: Nenhum sistema crowdsourced confia em indivíduos. Confiança emerge de: (1) validação client-side, (2) trust score ponderado, (3) consenso espacial entre múltiplos usuários, (4) restrições de rede viária.

## 🗂️ Estado Atual do Repositório (Verificado)
| Arquivo | Status | Observação |
|---------|--------|-----------|
| src/lib/trackValidator.ts | ✅ PRONTO | Exporta validateBusPattern(), formatValidationResult(), interfaces tipadas |
| prisma/schema.prisma | ✅ PRONTO | Tem enum TrackStatus, campos trustScore, metadata, status |
| src/services/reputation.ts | ✅ PRONTO | Função para atualizar score do usuário |
| src/pages/Contribuir.tsx | ❌ PENDENTE | Não importa nem usa o validador - FOCO DESTA TASK |
| src/services/trackingService.ts | ⚠️ PARCIAL | Pode precisar ajustar payload para aceitar validationMeta |
| API Routes (backend) | ❌ PENDENTE | Precisa aceitar e processar validationMeta |

## 🎯 TAREFAS EM ORDEM DE EXECUÇÃO (Não pule etapas)

### 🔴 TAREFA 1: Integrar validador no Contribuir.tsx (PRIORIDADE MÁXIMA)
Arquivo: src/pages/Contribuir.tsx
Objetivo: Chamar validateBusPattern() antes de enviar dados ao backend e mostrar aviso se o padrão não parecer de ônibus.

Passo 1.1: Adicionar imports no topo do arquivo
import { validateBusPattern, formatValidationResult, type TrackValidationResult } from '@/lib/trackValidator';

Passo 1.2: Criar função auxiliar de confirmação (adicione antes do componente principal)
const confirmValidation = async (validation: TrackValidationResult): Promise<boolean> => {
  return window.confirm(
    `⚠️ Padrão incomum detectado\n\n${formatValidationResult(validation)}\n\nDeseja enviar mesmo assim para análise?`
  );
};

Passo 1.3: Localizar e modificar a função de submit da trajetória
Encontre a função que envia os dados para o backend. Substitua/adicione o bloco abaixo imediatamente antes da chamada de envio:

// === 🛡️ BLOCO DE VALIDAÇÃO CLIENT-SIDE - INÍCIO ===
const validation = validateBusPattern(recordedTrack);

if (!validation.isValid) {
  const confirmed = await confirmValidation(validation);
  if (!confirmed) {
    toast.info('Envio cancelado. Ajuste a gravação e tente novamente.');
    setIsRecording(false);
    return;
  }
  toast.warning('Enviando com confiança reduzida para análise manual');
}

const trajectoryPayload = {
  track: recordedTrack,
  lineId: selectedLineId,
  direction: selectedDirection || 'ida',
  wifiInfo: selectedWifi ? { ssid: selectedWifi.ssid, bssid: selectedWifi.bssid } : undefined,
  validationMeta: {
    clientConfidence: validation.confidence,
    estimatedStops: validation.estimatedStops,
    reasons: validation.reasons,
    avgSpeed: validation.avgSpeed,
    maxSpeed: validation.maxSpeed,
    duration: validation.duration,
    distance: validation.distance,
    wifiValidated: !!selectedWifi
  }
};
// === 🛡️ BLOCO DE VALIDAÇÃO CLIENT-SIDE - FIM ===

// === ENVIO PARA API (mantenha a lógica existente, apenas use o novo payload) ===
try {
  await trackingService.submitTrajectory(trajectoryPayload);
  toast.success('Rota enviada para análise! 🎉');
} catch (error) {
  console.error('Erro ao enviar trajetória:', error);
  toast.error('Falha ao enviar. Verifique sua conexão e tente novamente.');
}

Passo 1.4: Indicador visual de confiança (opcional)
{validation && validation.confidence < 0.7 && (
  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mt-3">
    ⚠️ Confiança: {(validation.confidence * 100).toFixed(0)}% • Esta rota será revisada antes de aparecer para outros usuários
  </div>
)}

### 🔴 TAREFA 2: Atualizar endpoint da API para aceitar validationMeta
Arquivo provável: src/pages/api/tracking/submit.ts ou src/routes/trajectory.ts
Objetivo: Receber validationMeta, calcular trustScore inicial e salvar com status: 'pending'.

Passo 2.1: Tipar o payload recebido
export interface SubmitTrajectoryBody {
  track: Array<{ lat: number; lng: number; timestamp: number; speed?: number; accuracy?: number }>;
  lineId: string;
  direction: 'ida' | 'volta';
  wifiInfo?: { ssid: string; bssid: string };
  validationMeta?: {
    clientConfidence: number;
    estimatedStops: number;
    reasons: string[];
    avgSpeed?: number;
    maxSpeed?: number;
    duration?: number;
    distance?: number;
    wifiValidated: boolean;
  };
  userId: string;
}

Passo 2.2: Função para calcular trustScore inicial
const calculateInitialTrust = (validationMeta?: SubmitTrajectoryBody['validationMeta'], userTrust?: number): number => {
  const baseScore = validationMeta?.clientConfidence ?? 0.5;
  const userFactor = (userTrust ?? 0.5) * 0.2;
  const wifiBonus = validationMeta?.wifiValidated ? 0.15 : 0;
  return Math.min(1.0, Math.max(0.1, baseScore + userFactor + wifiBonus));
};

Passo 2.3: Atualizar salvamento no Prisma
const initialTrust = calculateInitialTrust(validationMeta, user?.trustScore);
const trajectory = await prisma.trajectory.create({
  data: {
    userId,
    lineId,
    direction,
    status: 'pending',
    trustScore: initialTrust,
    points: track,
    metadata: { ...validationMeta, submittedAt: new Date().toISOString(), userAgent: req.headers['user-agent'] },
    wifiInfo: wifiInfo || null
  }
});

Passo 2.4: Resposta da API
return res.status(201).json({
  success: true,
  trajectoryId: trajectory.id,
  status: trajectory.status,
  trustScore: trajectory.trustScore,
  message: validationMeta?.clientConfidence && validationMeta.clientConfidence < 0.7 ? 'Enviado para análise manual' : 'Enviado com sucesso'
});

### 🟡 TAREFA 3: Criar serviço de clustering espacial (processamento assíncrono)
Arquivo: src/services/clusterRoutes.ts (crie se não existir)
Objetivo: Agrupar trajetórias similares e promover para verified quando houver consenso.

Passo 3.1: Instalar dependência
npm install @turf/turf

Passo 3.2: Implementar serviço completo
// src/services/clusterRoutes.ts
import * as turf from '@turf/turf';
import { prisma } from '@/lib/prisma';
import { updateReputation } from './reputation';

export interface ClusterResult {
  routeId: string;
  trajectoryIds: string[];
  avgTrust: number;
  similarity: number;
  status: 'draft' | 'verified';
  lineId: string;
  direction: string;
}

export const runSpatialClustering = async (lineId: string, direction?: 'ida' | 'volta'): Promise<ClusterResult[]> => {
  console.log(`[Clustering] Iniciando para linha ${lineId}${direction ? ` (${direction})` : ''}`);
  const pending = await prisma.trajectory.findMany({
    where: { lineId, direction: direction || undefined, status: 'pending' },
    include: { user: true },
    orderBy: { createdAt: 'asc' }
  });
  if (pending.length < 3) return [];

  const lineStrings = pending.map(t => {
    const coords = (t.points as any[]).map((p: any) => [p.lng, p.lat] as [number, number]);
    return turf.lineString(coords);
  });

  const results: ClusterResult[] = [];
  const visited = new Set<number>();

  for (let i = 0; i < lineStrings.length; i++) {
    if (visited.has(i)) continue;
    const cluster: number[] = [i];
    visited.add(i);
    for (let j = i + 1; j < lineStrings.length; j++) {
      if (visited.has(j)) continue;
      const centroidI = turf.centroid(lineStrings[i]);
      const centroidJ = turf.centroid(lineStrings[j]);
      const distance = turf.distance(centroidI, centroidJ, { units: 'kilometers' });
      if (distance < 0.8) {
        cluster.push(j);
        visited.add(j);
      }
    }
    if (cluster.length >= 3) {
      const trajectories = cluster.map(idx => pending[idx]);
      const avgTrust = trajectories.reduce((sum, t) => sum + t.trustScore, 0) / trajectories.length;
      const status: 'draft' | 'verified' = avgTrust >= 0.75 ? 'verified' : 'draft';
      results.push({
        routeId: `route_${lineId}_${direction || 'mixed'}_${Date.now()}`,
        trajectoryIds: trajectories.map(t => t.id),
        avgTrust: Math.round(avgTrust * 100) / 100,
        similarity: Math.round((1 - Math.min(distance / 2, 1)) * 100) / 100,
        status,
        lineId,
        direction: direction || 'mixed'
      });
      await prisma.trajectory.updateMany({
        where: { id: { in: trajectories.map(t => t.id) } },
        data: { status, verifiedAt: status === 'verified' ? new Date() : null }
      });
      for (const t of trajectories) await updateReputation(t.userId, status);
    }
  }
  return results;
};

export const runClusteringAllLines = async (): Promise<void> => {
  const activeLines = await prisma.line.findMany({ where: { active: true }, select: { id: true } });
  for (const line of activeLines) {
    try { await runSpatialClustering(line.id); await new Promise(r => setTimeout(r, 100)); } 
    catch (e) { console.error(`[Clustering] Erro linha ${line.id}:`, e); }
  }
};

Passo 3.3: Trigger (escolha UMA opção)
Opção A (Cron simples):
// src/cron/clusterRoutes.cron.ts
import cron from 'node-cron';
import { runClusteringAllLines } from '@/services/clusterRoutes';
export const initClusteringCron = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron] 🔄 Executando clustering...');
    await runClusteringAllLines();
  });
};
// Registrar no entry point do servidor:
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  import('@/cron/clusterRoutes.cron').then(({ initClusteringCron }) => initClusteringCron());
}

### 🟡 TAREFA 4: Atualizar API de consulta de rotas
Arquivo provável: src/pages/api/lines/[id]/routes.ts
Objetivo: Permitir filtrar rotas por status.

Passo 4.1: Filtro por status
const statusParam = req.query.status as string || 'verified';
const statusFilter = statusParam === 'all' ? undefined : { in: statusParam.split(',') };
const routes = await prisma.trajectory.findMany({
  where: { lineId: req.query.id as string, status: statusFilter, trustScore: statusParam === 'verified' ? { gte: 0.7 } : undefined },
  select: { id: true, direction: true, status: true, trustScore: true, points: true, metadata: true, createdAt: true, verifiedAt: true },
  orderBy: { trustScore: 'desc' }
});

Passo 4.2: Resposta formatada
return res.status(200).json({
  success: true,
  lineId: req.query.id,
  routes: routes.map(r => ({ ...r, confidence: r.trustScore >= 0.8 ? 'high' : r.trustScore >= 0.6 ? 'medium' : 'low' })),
  meta: { total: routes.length, verified: routes.filter(r => r.status === 'verified').length }
});

### 🟢 TAREFA 5: Componente UI para badges de status (Opcional)
Arquivo: src/components/RouteStatusBadge.tsx
export const RouteStatusBadge = ({ status, trustScore, size = 'sm' }: { status: string; trustScore: number; size?: 'sm' | 'md' }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    verified: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Verificada' },
    draft: { bg: 'bg-amber-100', text: 'text-amber-800', label: '🟡 Em análise' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: '⏳ Pendente' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Rejeitada' }
  };
  const { bg, text, label } = config[status] || config.pending;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return <span className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${sizeClass}`}>{label} {trustScore >= 0.7 && `(${Math.round(trustScore*100)}%)`}</span>;
};

## ✅ CRITÉRIOS DE ACEITE (Definition of Done)
- [ ] Import de validateBusPattern adicionado sem erros de tipo
- [ ] Validação executada ANTES do envio ao backend
- [ ] Modal/confirm aparece quando !isValid
- [ ] Payload inclui validationMeta com todos os campos
- [ ] Endpoint aceita validationMeta sem quebrar
- [ ] trustScore calculado corretamente (base + user + wifi)
- [ ] Trajetória salva com status: 'pending'
- [ ] @turf/turf instalado e importado sem erros
- [ ] Clustering agrupa por similaridade espacial
- [ ] Clusters com ≥3 trajetórias mudam status para verified ou draft
- [ ] user.trustScore atualizado após clustering
- [ ] Cron/fila configurado e executando
- [ ] Endpoint de rotas filtra por status via query param
- [ ] npm run typecheck e npm run build passam sem erros

## 🐛 DEBUG & ROLLBACK
Comandos úteis:
npx tsc --noEmit --watch
curl -X POST http://localhost:3000/api/tracking/submit -H "Content-Type: application/json" -d '{"track":[{"lat":-10.2,"lng":-48.3,"timestamp":123,"speed":10}],"lineId":"test","direction":"ida","validationMeta":{"clientConfidence":0.9,"estimatedStops":5,"reasons":[],"wifiValidated":false},"userId":"user-test"}'
npx prisma studio

Rollback rápido:
git stash push -u -m "before-validation-integration"
git stash pop (ou git stash drop)

Logs estratégicos:
console.log('🔍 [Validation] Track:', { points: recordedTrack.length, result: validation });
console.log('📥 [API] Received trajectory:', { lineId, userId, points: track.length, validationMeta: validationMeta?.clientConfidence });

## 📦 DEPENDÊNCIAS
npm install @turf/turf@^7.1.0 node-cron@^3.0.3

## 🎯 INSTRUÇÃO FINAL PARA O AGENTE MCP
Você é um engenheiro de software sênior trabalhando no projeto TarifaZero. Sua missão é implementar as 5 tarefas descritas neste arquivo, na ordem exata apresentada.
Regras obrigatórias:
1. Após cada tarefa, execute npx tsc --noEmit e confirme zero erros de tipo antes de prosseguir
2. Mantenha a lógica e estrutura existente do projeto - adapte os snippets ao contexto real
3. Se encontrar divergência, PRIORIZE a estrutura existente e ajuste o snippet, não o contrário
4. Adicione logs estratégicos com prefixos [Validation], [API], [Clustering]
5. Funcionalidade > Perfeição
Comece agora pela Tarefa 1. Confirme cada etapa antes de prosseguir.