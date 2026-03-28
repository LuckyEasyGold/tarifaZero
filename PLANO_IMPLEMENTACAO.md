# 🚌 Plano de Implementação - Tarifa Zero v2.0

**Data de Início:** 28/03/2026  
**Status Atual:** ⏸️ Planejamento  
**Última Atualização:** 28/03/2026

---

## 📋 Visão Geral

Migração do projeto Tarifa Zero de simulação estática para sistema real com:
- Backend API completo (Node.js/TypeScript)
- Banco de dados PostgreSQL (Neon)
- Sistema de crowdsourcing
- Rastreamento em tempo real
- Motor de inferência de posição

---

## 🏗️ Arquitetura Proposta

### Frontend
- **Hospedagem:** Vercel
- **Stack:** React + TypeScript + Vite (mantido)
- **Mudanças:** Substituir simulação por API real

### Backend
- **Hospedagem:** Vercel Serverless Functions
- **Stack:** Node.js + TypeScript
- **Framework:** Express.js (ou Hono para edge)

### Banco de Dados
- **Serviço:** Neon PostgreSQL
- **Extensões:** PostGIS (geolocalização)
- **Cache:** Vercel KV (Redis) para posições em tempo real

---

## ✅ Checklist de Implementação

### FASE 1: Infraestrutura Base
- [x] 1.1 - Criar estrutura de pastas do backend
- [x] 1.2 - Configurar TypeScript para backend
- [x] 1.3 - Criar arquivo de variáveis de ambiente
- [x] 1.4 - Criar schema Prisma completo
- [x] 1.5 - Criar utilitários (db, response, validation)
- [x] 1.6 - Configurar Vercel (vercel.json)
- [x] 1.7 - Criar conta/projeto no Neon PostgreSQL
- [x] 1.8 - Configurar PostGIS no Neon
- [x] 1.9 - Instalar dependências (npm install)
- [x] 1.10 - Criar tabelas no banco (npm run db:push)
- [x] 1.11 - Validar banco com Prisma Studio

**Tempo Estimado:** 2-3 horas  
**Status:** ✅ Concluído

---

### FASE 2: Modelagem do Banco de Dados
- [ ] 2.1 - Criar tabela `lines` (linhas de ônibus)
- [ ] 2.2 - Criar tabela `routes` (rotas ida/volta)
- [ ] 2.3 - Criar tabela `route_points` (pontos da rota)
- [ ] 2.4 - Criar tabela `stops` (paradas)
- [ ] 2.5 - Criar tabela `trips` (viagens programadas)
- [ ] 2.6 - Criar tabela `vehicle_positions` (posições em tempo real)
- [ ] 2.7 - Criar tabela `user_tracks` (tracking de usuários)
- [ ] 2.8 - Criar tabela `wifi_networks` (redes Wi-Fi dos ônibus)
- [ ] 2.9 - Criar índices espaciais (PostGIS)
- [ ] 2.10 - Popular dados iniciais das 5 linhas existentes

**Tempo Estimado:** 3-4 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `database/schema.sql`
- `database/migrations/001_initial_schema.sql`
- `database/seeds/001_lines.sql`

---

### FASE 3: API - Endpoints Básicos
- [ ] 3.1 - Configurar conexão com Neon (pg/Prisma)
- [ ] 3.2 - Criar endpoint `GET /api/lines` (listar linhas)
- [ ] 3.3 - Criar endpoint `GET /api/lines/:id` (detalhes da linha)
- [ ] 3.4 - Criar endpoint `GET /api/lines/:id/route` (rota completa)
- [ ] 3.5 - Criar endpoint `GET /api/stops` (listar paradas)
- [ ] 3.6 - Criar endpoint `GET /api/stops/nearby` (paradas próximas)
- [ ] 3.7 - Testar todos os endpoints

**Tempo Estimado:** 4-5 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `api/lines/index.ts`
- `api/lines/[id].ts`
- `api/stops/index.ts`
- `api/stops/nearby.ts`

---

### FASE 4: Sistema de Crowdsourcing
- [ ] 4.1 - Criar endpoint `POST /api/tracking/start` (iniciar tracking)
- [ ] 4.2 - Criar endpoint `POST /api/tracking/point` (enviar ponto)
- [ ] 4.3 - Criar endpoint `POST /api/tracking/stop` (finalizar tracking)
- [ ] 4.4 - Implementar validação de dados GPS
- [ ] 4.5 - Implementar detecção de outliers
- [ ] 4.6 - Criar algoritmo de simplificação de rota (Douglas-Peucker)
- [ ] 4.7 - Criar processo de agregação de rotas
- [ ] 4.8 - Testar com dados simulados

**Tempo Estimado:** 6-8 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `api/tracking/start.ts`
- `api/tracking/point.ts`
- `api/tracking/stop.ts`
- `lib/gps-validator.ts`
- `lib/route-simplifier.ts`

---

### FASE 5: Identificação de Veículos
- [ ] 5.1 - Criar endpoint `POST /api/vehicle/identify` (identificar ônibus)
- [ ] 5.2 - Implementar lógica de matching por SSID
- [ ] 5.3 - Implementar lógica de matching por BSSID
- [ ] 5.4 - Implementar matching por proximidade geográfica
- [ ] 5.5 - Criar sistema de confiança (score 0-1)
- [ ] 5.6 - Implementar cache de identificações recentes
- [ ] 5.7 - Testar com diferentes cenários

**Tempo Estimado:** 5-6 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `api/vehicle/identify.ts`
- `lib/vehicle-matcher.ts`
- `lib/confidence-calculator.ts`

---

### FASE 6: Rastreamento em Tempo Real
- [ ] 6.1 - Criar endpoint `POST /api/vehicle/position` (enviar posição)
- [ ] 6.2 - Criar endpoint `GET /api/vehicle/position/:lineId` (obter posição)
- [ ] 6.3 - Implementar agregação de múltiplos usuários
- [ ] 6.4 - Implementar cálculo de posição média ponderada
- [ ] 6.5 - Implementar detecção de outliers
- [ ] 6.6 - Configurar cache Redis (Vercel KV)
- [ ] 6.7 - Implementar WebSocket/SSE para updates em tempo real
- [ ] 6.8 - Testar com múltiplos usuários simulados

**Tempo Estimado:** 8-10 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `api/vehicle/position.ts`
- `api/vehicle/stream.ts` (WebSocket/SSE)
- `lib/position-aggregator.ts`
- `lib/outlier-detector.ts`

---

### FASE 7: Motor de Inferência
- [ ] 7.1 - Criar endpoint `GET /api/vehicle/predict-position` (prever posição)
- [ ] 7.2 - Implementar cálculo de velocidade média por trecho
- [ ] 7.3 - Implementar ajuste por horário do dia
- [ ] 7.4 - Implementar ajuste por tipo de trecho
- [ ] 7.5 - Criar sistema de aprendizado de velocidades
- [ ] 7.6 - Implementar cálculo de confiança da previsão
- [ ] 7.7 - Criar job para atualizar estatísticas
- [ ] 7.8 - Testar precisão das previsões

**Tempo Estimado:** 10-12 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `api/vehicle/predict-position.ts`
- `lib/inference-engine.ts`
- `lib/speed-calculator.ts`
- `lib/learning-system.ts`

---

### FASE 8: Sistema de Roteamento
- [ ] 8.1 - Criar endpoint `POST /api/route/search` (buscar rota)
- [ ] 8.2 - Implementar busca de paradas próximas
- [ ] 8.3 - Implementar algoritmo de matching de linhas
- [ ] 8.4 - Implementar cálculo de tempo estimado
- [ ] 8.5 - Implementar suporte a múltiplas conexões
- [ ] 8.6 - Implementar ordenação por critérios (tempo/distância)
- [ ] 8.7 - Criar visualização de rotas sugeridas
- [ ] 8.8 - Testar com diferentes origens/destinos

**Tempo Estimado:** 8-10 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a criar:**
- `api/route/search.ts`
- `lib/route-finder.ts`
- `lib/time-estimator.ts`

---

### FASE 9: Integração Frontend
- [ ] 9.1 - Criar serviço de API no frontend
- [ ] 9.2 - Substituir dados mockados por chamadas reais
- [ ] 9.3 - Implementar hook `useRealTimePosition`
- [ ] 9.4 - Implementar componente de tracking do usuário
- [ ] 9.5 - Implementar identificação automática de ônibus
- [ ] 9.6 - Adicionar indicadores de confiança no mapa
- [ ] 9.7 - Implementar busca de rotas
- [ ] 9.8 - Adicionar feedback visual de contribuição
- [ ] 9.9 - Implementar modo offline
- [ ] 9.10 - Testar integração completa

**Tempo Estimado:** 10-12 horas  
**Status:** ⏸️ Não iniciado

**Arquivos a modificar/criar:**
- `src/services/api.ts`
- `src/hooks/useRealTimePosition.ts`
- `src/components/UserTracker.tsx`
- `src/components/RouteSearch.tsx`

---

### FASE 10: Testes e Otimização
- [ ] 10.1 - Criar testes unitários para funções críticas
- [ ] 10.2 - Criar testes de integração para API
- [ ] 10.3 - Testar com dados reais (grupo de 200 usuários)
- [ ] 10.4 - Otimizar queries do banco de dados
- [ ] 10.5 - Implementar rate limiting
- [ ] 10.6 - Implementar logging e monitoramento
- [ ] 10.7 - Configurar alertas de erro
- [ ] 10.8 - Documentar API (Swagger/OpenAPI)
- [ ] 10.9 - Criar guia de contribuição para usuários
- [ ] 10.10 - Deploy final e monitoramento

**Tempo Estimado:** 8-10 horas  
**Status:** ⏸️ Não iniciado

---

## 📊 Resumo de Progresso

| Fase | Nome | Status | Progresso |
|------|------|--------|-----------|
| 1 | Infraestrutura Base | ✅ | 100% |
| 2 | Modelagem do Banco | ⏸️ | 0% |
| 3 | API - Endpoints Básicos | ⏸️ | 0% |
| 4 | Sistema de Crowdsourcing | ⏸️ | 0% |
| 5 | Identificação de Veículos | ⏸️ | 0% |
| 6 | Rastreamento em Tempo Real | ⏸️ | 0% |
| 7 | Motor de Inferência | ⏸️ | 0% |
| 8 | Sistema de Roteamento | ⏸️ | 0% |
| 9 | Integração Frontend | ⏸️ | 0% |
| 10 | Testes e Otimização | ⏸️ | 0% |

**Progresso Total:** 11/100 tarefas (11%)

---

## 🎯 Próximos Passos Imediatos

1. Criar conta no Neon PostgreSQL
2. Configurar projeto no Vercel
3. Criar estrutura de pastas do backend
4. Iniciar FASE 1

---

## 📝 Notas e Decisões

### Decisões Técnicas
- **ORM:** Prisma (melhor DX com TypeScript + PostGIS)
- **Cache:** Vercel KV (integração nativa)
- **Real-time:** Server-Sent Events (mais simples que WebSocket no Vercel)
- **Validação:** Zod (type-safe)

### Custos Estimados (Mensal)
- Neon PostgreSQL: Gratuito até 0.5GB (depois ~$19/mês)
- Vercel: Gratuito (Hobby) ou $20/mês (Pro)
- Vercel KV: Gratuito até 256MB
- **Total inicial:** R$ 0 (dentro dos limites gratuitos)

### Riscos Identificados
1. Precisão dos dados de crowdsourcing
2. Latência do banco de dados (Neon cold start)
3. Limite de execução do Vercel (10s por função)
4. Custo com escala de usuários

---

## 🔄 Log de Alterações

| Data | Fase | Descrição |
|------|------|-----------|
| 28/03/2026 | - | Plano criado |
| 28/03/2026 | 1 | Estrutura backend criada (60% completo) |
| 28/03/2026 | 1 | FASE 1 CONCLUÍDA - Banco configurado e funcionando ✅ |

---

## 📞 Contatos e Recursos

- **Documentação Neon:** https://neon.tech/docs
- **Documentação Vercel:** https://vercel.com/docs
- **PostGIS:** https://postgis.net/documentation/
- **Prisma + PostGIS:** https://www.prisma.io/docs/orm/prisma-schema/data-model/unsupported-database-features

---

**Legenda de Status:**
- ⏸️ Não iniciado
- 🔄 Em progresso
- ✅ Concluído
- ⚠️ Bloqueado
- ❌ Cancelado
