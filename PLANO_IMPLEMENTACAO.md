# 🚌 Plano de Implementação - Tarifa Zero v2.0

**Data de Início:** 28/03/2026  
**Status Atual:** 🔄 Em Desenvolvimento Ativo  
**Última Atualização:** 29/03/2026

---

## 📋 Visão Geral

Migração do projeto Tarifa Zero de simulação estática para sistema real com:
- Backend API completo (Node.js/JavaScript - Vercel Serverless)
- Banco de dados PostgreSQL com PostGIS (Neon)
- Sistema de crowdsourcing com GPS em tempo real
- Interface mobile-first com navegação multi-tela
- Sistema de gamificação e ranking
- Rastreamento em tempo real

---

## 🏗️ Arquitetura Implementada

### Frontend
- **Hospedagem:** Vercel ✅
- **Stack:** React + TypeScript + Vite ✅
- **Roteamento:** React Router DOM (multi-tela) ✅
- **Mapa:** Leaflet + React-Leaflet ✅
- **UI:** Tailwind CSS + Radix UI ✅

### Backend
- **Hospedagem:** Vercel Serverless Functions ✅
- **Stack:** Node.js + JavaScript (`.js` por limitação do Vercel) ✅
- **ORM:** Prisma ✅

### Banco de Dados
- **Serviço:** Neon PostgreSQL ✅
- **Extensões:** PostGIS (geolocalização) ✅
- **Tabelas:** 9 tabelas criadas e populadas ✅

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
- [x] 2.1 - Criar tabela `lines` (linhas de ônibus)
- [x] 2.2 - Criar tabela `routes` (rotas ida/volta)
- [x] 2.3 - Criar tabela `route_points` (pontos da rota)
- [x] 2.4 - Criar tabela `stops` (paradas)
- [x] 2.5 - Criar tabela `trips` (viagens programadas)
- [x] 2.6 - Criar tabela `vehicle_positions` (posições em tempo real)
- [x] 2.7 - Criar tabela `user_tracks` (tracking de usuários)
- [x] 2.8 - Criar tabela `wifi_networks` (redes Wi-Fi dos ônibus)
- [x] 2.9 - Criar índices espaciais (PostGIS)
- [x] 2.10 - Popular dados iniciais das 5 linhas existentes

**Tempo Estimado:** 3-4 horas  
**Status:** ✅ Concluído

**Arquivos a criar:**
- `database/schema.sql`
- `database/migrations/001_initial_schema.sql`
- `database/seeds/001_lines.sql`

---

### FASE 3: API - Endpoints Básicos
- [x] 3.1 - Configurar conexão com Neon (Prisma)
- [x] 3.2 - Criar endpoint `GET /api/lines` (listar linhas)
- [x] 3.3 - Criar endpoint `GET /api/lines/:id` (detalhes da linha)
- [x] 3.4 - Criar endpoint `GET /api/lines/:id/map` (dados otimizados para mapa)
- [x] 3.5 - Criar endpoint `GET /api/stops/nearby` (paradas próximas com PostGIS)
- [x] 3.6 - Criar endpoint `GET /api/health` (health check)
- [x] 3.7 - Testar todos os endpoints em produção

**Tempo Estimado:** 4-5 horas  
**Tempo Real:** 6 horas  
**Status:** ✅ Concluído

**Arquivos criados:**
- `api/index.js` ✅
- `api/health.js` ✅
- `api/lines/index.js` ✅
- `api/lines/[id].js` ✅
- `api/lines/[id]/map.js` ✅
- `api/stops/nearby.js` ✅

**Desafios enfrentados:**
- TypeScript não compila corretamente no Vercel → Solução: usar `.js`
- Rewrites causando 404 → Solução: configuração específica no `vercel.json`
- Cache do domínio → Solução: usar `vercel alias` para forçar atualização

### FASE 3.5: Interface Multi-Tela (Mobile-First)
- [x] 3.5.1 - Instalar React Router DOM
- [x] 3.5.2 - Criar estrutura de páginas (Home, Linhas, Buscar, Contribuir)
- [x] 3.5.3 - Criar componente BottomNav (navegação inferior)
- [x] 3.5.4 - Implementar página Home (mapa com ônibus)
- [x] 3.5.5 - Implementar página Linhas (lista de linhas da API)
- [x] 3.5.6 - Implementar página LinhaDetalhes (detalhes + mapa)
- [x] 3.5.7 - Implementar página BuscarRota (placeholder FASE 8)
- [x] 3.5.8 - Implementar página Contribuir (tracking GPS)
- [x] 3.5.9 - Configurar rewrites no Vercel para SPA
- [x] 3.5.10 - Testar navegação em produção

**Tempo Estimado:** 4 horas  
**Tempo Real:** 3 horas  
**Status:** ✅ Concluído

**Arquivos criados:**
- `src/pages/Home.tsx` ✅
- `src/pages/Linhas.tsx` ✅
- `src/pages/LinhaDetalhes.tsx` ✅
- `src/pages/BuscarRota.tsx` ✅
- `src/pages/Contribuir.tsx` ✅
- `src/components/BottomNav.tsx` ✅

---

- [x] 4.1 - Criar hooks de geolocalização (`useGeolocation`)
- [x] 4.2 - Criar hook de detecção de Wi-Fi (`useWifiDetection`)
- [x] 4.3 - Criar endpoint `POST /api/tracking/session` (iniciar/parar sessão)
- [x] 4.4 - Criar endpoint `POST /api/tracking/submit` (enviar pontos GPS)
- [x] 4.5 - Criar serviço de tracking no frontend (`trackingService`)
- [x] 4.6 - Implementar interface de contribuição com seleção de linha
- [x] 4.7 - Implementar visualização de tracking em tempo real no mapa
- [x] 4.8 - Mostrar estatísticas ao vivo (tempo, pontos, precisão, velocidade)
- [x] 4.9 - Implementar sistema de gamificação e pontuação
- [x] 4.10 - Criar tabela `users` com pontos, níveis, badges
- [x] 4.11 - Criar endpoint `GET /api/gamification/ranking`
- [x] 4.12 - Criar endpoint `GET /api/gamification/user`
- [x] 4.13 - Criar endpoint `POST /api/gamification/user`
- [x] 4.14 - Criar página de ranking de contribuidores
- [x] 4.15 - Implementar badges e conquistas
- [x] 4.16 - Implementar tela splash com vídeo
- [x] 4.17 - Configurar Capacitor para Android
- [x] 4.18 - Criar plugin nativo WifiScanner
- [x] 4.19 - Adicionar permissões Android (Wi-Fi, GPS)
- [x] 4.20 - Corrigir build do GitHub Actions (TypeScript config)
- [ ] 4.21 - Testar APK em dispositivo físico
- [ ] 4.22 - Implementar validação de Wi-Fi (só rastrear se detectar ônibus)

**Tempo Estimado:** 6-8 horas  
**Tempo Real:** 14 horas (em andamento)  
**Status:** 🔄 Em Progresso (92%)

**Arquivos criados:**
- `src/hooks/useGeolocation.ts` ✅
- `src/hooks/useWifiDetection.ts` ✅
- `src/hooks/useWifiScanner.ts` ✅
- `src/services/trackingService.ts` ✅
- `api/tracking/session.js` ✅
- `api/tracking/submit.js` ✅
- `api/gamification/ranking.js` ✅
- `api/gamification/user.js` ✅
- `src/pages/Contribuir.tsx` ✅
- `src/pages/Ranking.tsx` ✅
- `src/components/SplashScreen.tsx` ✅
- `capacitor.config.ts` ✅
- `android/app/src/main/java/com/newsdrop/tarifazero/WifiScannerPlugin.java` ✅
- `android/app/src/main/java/com/newsdrop/tarifazero/MainActivity.java` ✅
- `LOCAL_BUILD_GUIDE.md` ✅

**Próximos passos:**
1. Aguardar conclusão do build local do Gradle (estava em 76%)
2. Testar APK em dispositivo físico
3. Implementar validação de Wi-Fi (só permitir tracking se detectar Wi-Fi do ônibus)
4. Adicionar lógica de identificação automática da linha pelo BSSID

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
- [x] 9.1 - Criar serviço de API no frontend (`trackingService`)
- [x] 9.2 - Substituir dados mockados por chamadas reais (página Linhas)
- [x] 9.3 - Implementar hooks customizados (useGeolocation, useWifiDetection)
- [x] 9.4 - Implementar componente de tracking do usuário
- [ ] 9.5 - Implementar hook `useRealTimePosition` para Home
- [ ] 9.6 - Mostrar usuários ativos no mapa Home
- [ ] 9.7 - Implementar identificação automática de ônibus
- [ ] 9.8 - Adicionar indicadores de confiança no mapa
- [ ] 9.9 - Implementar busca de rotas (FASE 8)
- [ ] 9.10 - Adicionar feedback visual de contribuição
- [ ] 9.11 - Implementar modo offline
- [ ] 9.12 - Testar integração completa

**Tempo Estimado:** 10-12 horas  
**Tempo Real:** 5 horas (em andamento)  
**Status:** 🔄 Em Progresso (40%)

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
| 2 | Modelagem do Banco | ✅ | 100% |
| 3 | API - Endpoints Básicos | ✅ | 100% |
| 3.5 | Interface Multi-Tela | ✅ | 100% |
| 4 | Sistema de Crowdsourcing | 🔄 | 92% |
| 5 | Identificação de Veículos | ⏸️ | 0% |
| 6 | Rastreamento em Tempo Real | ⏸️ | 0% |
| 7 | Motor de Inferência | ⏸️ | 0% |
| 8 | Sistema de Roteamento | ⏸️ | 0% |
| 9 | Integração Frontend | 🔄 | 40% |
| 10 | Testes e Otimização | ⏸️ | 0% |

**Progresso Total:** 62/117 tarefas (53%)

**Funcionalidades Implementadas:**
- ✅ Backend API completo com 9 endpoints
- ✅ Banco de dados com 10 tabelas e 844 pontos GPS
- ✅ Interface mobile-first com 6 telas (Home, Linhas, Detalhes, Buscar, Contribuir, Ranking)
- ✅ Navegação multi-tela funcional
- ✅ Sistema de tracking GPS em tempo real
- ✅ Visualização de tracking no mapa
- ✅ Coleta e envio de dados para API
- ✅ Sistema de gamificação completo
- ✅ Ranking de contribuidores com filtros
- ✅ Badges e conquistas
- ✅ Tela splash com vídeo
- ✅ Configuração Capacitor para Android
- ✅ Plugin nativo de Wi-Fi Scanner
- ⏳ Build do APK (em andamento)

---

## 🎯 Próximos Passos Imediatos

### Prioridade 1 (Agora)
1. ✅ Atualizar PLANO_IMPLEMENTACAO.md
2. ✅ Corrigir build do GitHub Actions (TypeScript config)
3. 🔄 Aguardar conclusão do build local do Gradle
4. 🔄 Testar APK em dispositivo físico

### Prioridade 2 (Próxima)
5. Implementar validação de Wi-Fi (só rastrear se detectar ônibus)
6. Adicionar identificação automática da linha pelo BSSID
7. Implementar visualização de usuários ativos no mapa Home
8. Adicionar WebSocket/SSE para updates em tempo real

### Prioridade 3 (Futuro)
8. Sistema de identificação por Wi-Fi
9. Motor de inferência de posição
10. Sistema de busca de rotas

---

## 📝 Notas e Decisões

### Decisões Técnicas
- **ORM:** Prisma (melhor DX com TypeScript + PostGIS) ✅
- **Linguagem Backend:** JavaScript (`.js`) - TypeScript não compila no Vercel
- **Cache:** Vercel KV (planejado para FASE 6)
- **Real-time:** Server-Sent Events ou WebSocket (planejado)
- **Validação:** Zod (planejado)
- **Roteamento Frontend:** React Router DOM ✅
- **Geolocalização:** Navigator.geolocation API ✅
- **Mapa:** Leaflet + React-Leaflet ✅

### Desafios Superados
1. ✅ TypeScript no Vercel → Solução: usar JavaScript puro
2. ✅ Rewrites causando 404 → Solução: configuração específica para SPA
3. ✅ Cache do domínio → Solução: `vercel alias` para forçar atualização
4. ✅ Navegação SPA no Vercel → Solução: rewrites com exceção para `/api/*`
5. ⏳ Erro na criação de sessão → Em investigação

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
| 28/03/2026 | 1 | FASE 1 CONCLUÍDA - Infraestrutura base ✅ |
| 28/03/2026 | 2 | FASE 2 CONCLUÍDA - Banco populado com 5 linhas ✅ |
| 28/03/2026 | 3 | FASE 3 CONCLUÍDA - 6 endpoints API funcionando ✅ |
| 29/03/2026 | 3.5 | FASE 3.5 CONCLUÍDA - Interface multi-tela mobile ✅ |
| 29/03/2026 | 4 | FASE 4 92% - Sistema completo de tracking + gamificação 🔄 |
| 29/03/2026 | 4 | Sistema de gamificação e ranking implementado ✅ |
| 29/03/2026 | 4 | Tela splash com vídeo adicionada ✅ |
| 29/03/2026 | 4 | Capacitor configurado + plugin Wi-Fi nativo ✅ |
| 29/03/2026 | 4 | Corrigido build do GitHub Actions (TypeScript) ✅ |
| 29/03/2026 | - | Plano atualizado com progresso real (53%) ✅ |

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
