# 🔄 FASE 2: Trust Score & Trajectory Model

## 🎯 Objetivo
Implementar sistema de reputação progressiva para usuários e armazenamento de contribuições com níveis de confiança, permitindo que rotas passem por validação antes de se tornarem oficiais.

---

## 📋 Tarefas da Fase 2

### 1. Atualizar Schema do Prisma
- [ ] Adicionar `trustScore` e `contributions` ao modelo `User`
- [ ] Criar modelo `Trajectory` para armazenar contribuições
- [ ] Criar enum `TrackStatus` (pending, draft, verified, rejected)
- [ ] Adicionar relações entre modelos

### 2. Migração de Banco de Dados
- [ ] Rodar `prisma db push` (sem perder dados)
- [ ] Verificar migração no Prisma Studio
- [ ] Atualizar rotas existentes para `verified`

### 3. Backend - API de Trajetórias
- [ ] Criar `api/trajectory/submit.ts` - Receber contribuições
- [ ] Modificar endpoint de sessão para criar `Trajectory`
- [ ] Calcular trust score inicial
- [ ] Armazenar metadados de validação

### 4. Sistema de Reputação
- [ ] Criar `src/services/reputation.ts`
- [ ] Função `updateUserTrust()` - Atualizar score
- [ ] Função `calculateInitialTrust()` - Score inicial
- [ ] Limites de trust score [0.1, 1.0]

### 5. Ajustes no Frontend
- [ ] Atualizar `trackingService` para novo fluxo
- [ ] Mostrar feedback de confiança ao usuário
- [ ] Ajustar gamificação baseada em status

---

## 📊 Schema Prisma - Mudanças

```prisma
model User {
  id                String        @id @default(cuid())
  anonymousId       String        @unique
  nickname          String?
  points            Int           @default(0)
  level             Int           @default(1)
  totalTrips        Int           @default(0)
  totalPoints       Int           @default(0)
  totalMinutes      Int           @default(0)
  badges            String[]
  streak            Int           @default(0)
  lastActive        DateTime      @default(now())
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  acceptedTerms     Boolean       @default(false)
  acceptedTermsDate DateTime?
  currentLat        Float?
  currentLng        Float?
  isOnline          Boolean       @default(false)
  isTracking        Boolean       @default(false)
  
  // NOVO: Trust Score
  trustScore        Float         @default(0.5)
  contributions     Int           @default(0)
  
  // Relações
  trajectories      Trajectory[]

  @@index([points])
  @@index([totalPoints])
  @@index([isOnline])
  @@index([trustScore])
  @@map("users")
}

enum TrackStatus {
  pending
  draft
  verified
  rejected
}

model Trajectory {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  lineId          String
  line            Line        @relation(fields: [lineId], references: [id])
  direction       String      @default("ida") // ida | volta
  status          TrackStatus @default(pending)
  trustScore      Float       @default(0.5)
  points          Json        // Array de {lat, lng, speed, ts, accuracy}
  metadata        Json?       // {clientConfidence, reasons, estimatedStops, deviceType, wifiValidated}
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  verifiedAt      DateTime?

  @@index([lineId, status])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("trajectories")
}

// Adicionar relação em Line
model Line {
  // ... campos existentes
  trajectories     Trajectory[]
}
```

---

## 🔄 Fluxo Atualizado

### Antes (Fase 1)
```
Usuário grava → Valida → Envia → Cria Route direto
```

### Depois (Fase 2)
```
Usuário grava → Valida → Envia
    ↓
Backend calcula trust score:
  • WiFi validado? +0.3
  • Padrão válido? +0.2
  • Histórico do usuário? +0.2
    ↓
Cria Trajectory com status=pending
    ↓
(Fase 3: Clustering vai processar)
```

---

## 💯 Cálculo de Trust Score

### Trust Score Inicial
```typescript
function calculateInitialTrust(
  clientConfidence: number,  // 0.0 - 1.0 da validação
  wifiValidated: boolean,    // true/false
  userTrustScore: number     // 0.1 - 1.0 histórico
): number {
  let score = clientConfidence; // Base: validação client-side
  
  if (wifiValidated) {
    score += 0.3; // WiFi adiciona confiança
  }
  
  // Histórico do usuário influencia
  score += userTrustScore * 0.2;
  
  // Limitar entre 0.1 e 1.0
  return Math.max(0.1, Math.min(1.0, score));
}
```

### Atualização de Trust Score do Usuário
```typescript
function updateUserTrust(
  currentScore: number,
  trajectoryStatus: 'verified' | 'rejected' | 'draft'
): number {
  let delta = 0;
  
  if (trajectoryStatus === 'verified') {
    delta = +0.15; // Contribuição verificada
  } else if (trajectoryStatus === 'rejected') {
    delta = -0.10; // Contribuição rejeitada
  } else if (trajectoryStatus === 'draft') {
    delta = +0.05; // Contribuição em análise
  }
  
  const newScore = currentScore + delta;
  
  // Limitar entre 0.1 e 1.0
  return Math.max(0.1, Math.min(1.0, newScore));
}
```

---

## 🎮 Gamificação Ajustada

### Pontos por Status
- `verified`: 100% dos pontos (ex: 50 pontos)
- `draft`: 50% dos pontos (ex: 25 pontos)
- `pending`: 25% dos pontos (ex: 12 pontos)
- `rejected`: 0 pontos

### Badges Novos
- 🌟 "Contribuidor Confiável" - Trust score ≥ 0.8
- 🏆 "Especialista em Rotas" - 10+ contribuições verified
- ⭐ "Pioneiro" - Primeira contribuição verified

---

## 📝 API Endpoints

### POST /api/trajectory/submit
Recebe contribuição de rota.

**Request:**
```json
{
  "userId": "user_123",
  "lineId": "line_456",
  "direction": "ida",
  "points": [
    {"lat": -26.484, "lng": -49.076, "speed": 8.5, "timestamp": 1234567890, "accuracy": 10}
  ],
  "validationMeta": {
    "clientConfidence": 0.85,
    "estimatedStops": 5,
    "reasons": [],
    "avgSpeed": 25,
    "maxSpeed": 45,
    "distance": 5.2,
    "duration": 1200,
    "wifiValidated": true,
    "wifiBSSID": "AA:BB:CC:DD:EE:FF"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trajectoryId": "traj_789",
    "status": "pending",
    "trustScore": 0.82,
    "pointsEarned": 12,
    "message": "Contribuição recebida! Será analisada em breve."
  }
}
```

### GET /api/trajectories?status=pending&lineId=123
Lista trajetórias (admin).

### PATCH /api/trajectory/:id/status
Atualiza status de trajetória (usado pelo clustering na Fase 3).

---

## ✅ Critérios de Aceite

- [ ] Modelo `Trajectory` criado no banco
- [ ] `trustScore` e `contributions` adicionados ao `User`
- [ ] Endpoint `/api/trajectory/submit` funcional
- [ ] Trust score calculado corretamente
- [ ] Contribuições armazenadas como `pending`
- [ ] Rotas existentes marcadas como `verified`
- [ ] Gamificação ajustada por status
- [ ] Sem quebra de funcionalidade existente
- [ ] Documentação inline nos arquivos

---

## 🚀 Próximos Passos Após Fase 2

**FASE 3: Consenso Espacial**
- Clustering de trajetórias similares
- Worker para processar pendentes
- Promover para `verified` após ≥3 usuários
- Sistema de rejeição automática

**FASE 4: UI de Status**
- Badges de status nas rotas
- Painel admin de trajetórias
- Transparência para usuários

---

## 📊 Impacto Esperado

### Antes da Fase 2
- ❌ Todas contribuições viram rotas oficiais
- ❌ Sem diferenciação de qualidade
- ❌ Sem histórico de reputação

### Depois da Fase 2
- ✅ Contribuições armazenadas com confiança
- ✅ Trust score progressivo
- ✅ Preparado para consenso espacial
- ✅ Gamificação mais justa
- ✅ Dados estruturados para análise

---

## ⏱️ Estimativa de Tempo

- Schema & Migração: 30 min
- API de Trajetórias: 1h
- Sistema de Reputação: 45 min
- Ajustes Frontend: 45 min
- Testes: 30 min

**Total: ~3-4 horas**
