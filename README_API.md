# Tarifa Zero — API Reference

API backend rodando como Vercel Serverless Functions. Todos os endpoints passam pelo roteador em `api/index.js`.

## Setup Local

```bash
# Instalar Vercel CLI
npm i -g vercel

# Rodar API localmente (junto com o frontend via vite proxy)
npm run dev

# Ou rodar API isolada
vercel dev
```

Variável de ambiente necessária:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

## Endpoints

### Linhas

```http
GET /api/lines
```
Retorna todas as linhas ativas.

```http
GET /api/lines/:id
```
Retorna detalhes de uma linha (rota, paradas, horários).

```http
GET /api/lines/:id/schedules
```
Retorna horários da linha por dia da semana.

```http
GET /api/lines/:id/trajectories?status=verified&limit=50&offset=0
```
Retorna trajetos gravados pelos usuários. `status` aceita: `pending`, `draft`, `verified`, `rejected`, `all`.

### Paradas

```http
GET /api/stops/nearby?lat=-26.484&lng=-51.989&radius=500
```
Retorna paradas num raio (metros) de uma coordenada.

### Gravação de Trajetos

```http
POST /api/trajectories/start
Body: { lineId, userId, direction }
```
Inicia uma sessão de gravação. Retorna `sessionId`.

```http
POST /api/trajectories/point
Body: { sessionId, lat, lng, speed, accuracy, heading }
```
Envia um ponto GPS da sessão em andamento.

```http
POST /api/trajectories/stop-mark
Body: { sessionId, lat, lng, name }
```
Marca uma parada durante a gravação.

```http
POST /api/trajectories/stop
Body: { sessionId, metadata: { clientConfidence, estimatedStops, reasons, avgSpeed, ... } }
```
Finaliza a sessão e salva o trajeto com metadados de validação.

### Gamificação

```http
GET /api/gamification/ranking?period=all&limit=10
```
Ranking de contribuidores. `period`: `all`, `week`, `month`.

```http
GET /api/gamification/user?anonymousId=xxx
```
Dados de gamificação de um usuário.

```http
POST /api/gamification/user
Body: { anonymousId, nickname?, acceptedTerms }
```
Cria ou atualiza usuário.

### Usuários Online

```http
GET /api/users/active
```
Retorna usuários com heartbeat recente (últimos 2 minutos).

```http
POST /api/users/heartbeat
Body: { anonymousId, lat?, lng?, isTracking }
```
Atualiza presença do usuário no mapa.

### Apoiadores

```http
GET /api/supporters
```
Retorna lista de apoiadores ativos.

### Versão

```http
GET /api/version
```
Retorna versão atual do app para notificação de update.

### Admin

```http
POST /api/admin/validate-routes
```
Executa validação e clustering de trajetos pendentes. Chamado automaticamente pelo cron do Vercel (a cada hora). Pode ser chamado manualmente para testes.

## Estrutura de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": true,
  "data": { ... }
}
```

Erros:

```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## Banco de Dados

```bash
npx prisma studio    # Interface visual
npm run db:push      # Aplicar mudanças no schema
npm run db:migrate   # Criar migration formal
npm run db:seed      # Popular com dados iniciais
```

Schema completo em `prisma/schema.prisma`.
