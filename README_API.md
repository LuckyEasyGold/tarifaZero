# 🚌 Tarifa Zero - API Backend

API completa para sistema de rastreamento de ônibus com crowdsourcing.

## 🚀 Setup Rápido

### 1. Instalar Dependências

```bash
# Instalar dependências do backend
cd api
npm install
cd ..

# Instalar Vercel CLI (global)
npm install -g vercel
```

### 2. Configurar Neon PostgreSQL

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. Copie a connection string
4. Cole no arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 3. Habilitar PostGIS no Neon

Execute no SQL Editor do Neon:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

### 4. Criar Banco de Dados

```bash
cd api
npm run db:push
```

### 5. Testar Localmente

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (Vercel Dev)
vercel dev
```

Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:3000/api

## 📁 Estrutura do Backend

```
api/
├── lib/
│   ├── db.ts           # Conexão Prisma + helpers PostGIS
│   ├── response.ts     # Utilitários de resposta HTTP
│   └── validation.ts   # Validação com Zod
├── lines/              # Endpoints de linhas (FASE 3)
├── stops/              # Endpoints de paradas (FASE 3)
├── tracking/           # Endpoints de tracking (FASE 4)
├── vehicle/            # Endpoints de veículos (FASE 5-7)
├── route/              # Endpoints de roteamento (FASE 8)
├── package.json
└── tsconfig.json

prisma/
└── schema.prisma       # Schema do banco de dados
```

## 🗄️ Banco de Dados

### Tabelas Principais

- `lines` - Linhas de ônibus
- `routes` - Rotas (ida/volta)
- `route_points` - Pontos da rota (shape)
- `stops` - Paradas
- `trips` - Viagens programadas
- `vehicle_positions` - Posições em tempo real
- `user_tracks` - Tracking de usuários
- `wifi_networks` - Redes Wi-Fi dos ônibus
- `speed_stats` - Estatísticas de velocidade

### Comandos Úteis

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar mudanças no schema
npm run db:push

# Criar migration
npm run db:migrate

# Abrir Prisma Studio (GUI)
npm run db:studio
```

## 🌐 Deploy na Vercel

### Primeira vez

```bash
vercel
```

Siga as instruções:
1. Link to existing project? No
2. Project name: tarifazero
3. Directory: ./
4. Override settings? No

### Configurar Variáveis de Ambiente

```bash
vercel env add DATABASE_URL
```

Cole sua connection string do Neon.

### Deploy de Produção

```bash
vercel --prod
```

## 📚 Endpoints (Planejados)

### Linhas
- `GET /api/lines` - Listar todas as linhas
- `GET /api/lines/:id` - Detalhes de uma linha
- `GET /api/lines/:id/route` - Rota completa da linha

### Paradas
- `GET /api/stops` - Listar paradas
- `GET /api/stops/nearby?lat=X&lng=Y&radius=500` - Paradas próximas

### Tracking (Crowdsourcing)
- `POST /api/tracking/start` - Iniciar sessão de tracking
- `POST /api/tracking/point` - Enviar ponto GPS
- `POST /api/tracking/stop` - Finalizar tracking

### Veículos
- `POST /api/vehicle/identify` - Identificar ônibus (Wi-Fi + GPS)
- `POST /api/vehicle/position` - Enviar posição do veículo
- `GET /api/vehicle/position/:lineId` - Obter posição atual
- `GET /api/vehicle/predict-position` - Prever posição (inferência)

### Roteamento
- `POST /api/route/search` - Buscar rota entre origem e destino

## 🔧 Desenvolvimento

### Adicionar Nova Tabela

1. Edite `prisma/schema.prisma`
2. Execute `npm run db:push`
3. Gere o client: `npm run db:generate`

### Criar Novo Endpoint

Crie arquivo em `api/[pasta]/[nome].ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success, error, validateMethod } from '../lib/response';
import { prisma } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const data = await prisma.line.findMany();
    return success(res, data);
  } catch (err) {
    return error(res, 'Erro ao buscar dados', 500);
  }
}
```

## 🐛 Troubleshooting

### Erro: "PostGIS not found"
Execute no Neon SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Erro: "Prisma Client not generated"
```bash
cd api
npm run db:generate
```

### Erro: "Connection timeout"
Verifique se a connection string está correta no `.env`

## 📖 Recursos

- [Neon Docs](https://neon.tech/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [PostGIS Docs](https://postgis.net/documentation/)

---

**Status:** FASE 1 Completa ✅
