# Arquitetura do Tarifa Zero

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS + Radix UI |
| Mapas | Leaflet + React-Leaflet |
| Roteamento | React Router DOM v7 |
| App nativo | Capacitor 8 (Android) |
| Backend | Vercel Serverless Functions (Node.js) |
| ORM | Prisma 5 |
| Banco | PostgreSQL + PostGIS (Neon) |
| CI/CD | GitHub Actions |

## Estrutura de Pastas

```
tarifaZero/
├── api/                        # Backend (Vercel Serverless)
│   ├── index.js               # Roteador principal de todos os endpoints
│   ├── trajectories/          # Endpoints de gravação de trajetos
│   │   └── index.ts           # start / stop / point / stop-mark
│   ├── lines/[id]/            # Endpoints de linhas
│   │   ├── schedules.ts       # Horários da linha
│   │   └── trajectories.ts    # Trajetos da linha (filtro por status)
│   └── admin/
│       └── validate-routes.ts # Validação automática (cron horário)
├── src/
│   ├── components/            # Componentes React reutilizáveis
│   │   └── map/               # Componentes de mapa (BusMap, icons)
│   ├── pages/                 # Páginas da aplicação
│   ├── hooks/                 # Hooks customizados
│   ├── services/              # Chamadas de API e lógica de negócio
│   ├── lib/                   # Utilitários (trackValidator, etc.)
│   └── types/                 # Tipos TypeScript globais
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Dados iniciais (linhas de Palmas-PR)
├── android/                   # Projeto Android gerado pelo Capacitor
│   └── app/src/main/java/com/newsdrop/tarifazero/
│       ├── MainActivity.java
│       ├── WifiScannerPlugin.java   # Plugin nativo de WiFi
│       └── ApkInstallerPlugin.java  # Plugin nativo de instalação de APK
├── public/                    # Assets estáticos servidos pelo Vercel
│   ├── version.json           # Versão atual para notificação de update
│   └── tarifazero.apk         # APK mais recente para download
└── scripts/                   # Scripts utilitários de manutenção
```

## Fluxo de Dados

```
Usuário (App Android)
    │
    ├─ Visualização → GET /api/lines → PostgreSQL
    │
    ├─ Contribuição (gravação de rota)
    │   ├─ POST /api/trajectories/start  → cria sessão
    │   ├─ POST /api/trajectories/point  → envia ponto GPS (a cada update)
    │   ├─ POST /api/trajectories/stop-mark → marca parada
    │   └─ POST /api/trajectories/stop   → finaliza com metadados de validação
    │
    └─ Validação automática (cron a cada hora)
        └─ GET /api/admin/validate-routes → compara trajetos, promove rotas
```

## Banco de Dados — Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários anônimos com gamificação e trust score |
| `lines` | Linhas de ônibus |
| `routes` / `route_points` | Rotas oficiais com pontos GPS |
| `stops` / `scheduled_times` | Paradas e horários |
| `trajectories` | Trajetos gravados pelos usuários (pending → verified) |
| `user_trajectories` | Sessões de gravação em andamento |
| `user_stops` | Paradas sugeridas pelos usuários |
| `vehicle_positions` | Posições de veículos (crowdsourced) |
| `wifi_networks` | Redes WiFi associadas a linhas |
| `supporters` | Apoiadores do projeto |

## Sistema de Validação de Trajetos

Trajetos passam por 3 camadas antes de virar rota oficial:

1. **Client-side** (`src/lib/trackValidator.ts`) — analisa velocidade, paradas e padrão de movimento para detectar se o usuário estava em um ônibus
2. **Trust score** — cada usuário tem um score progressivo; contribuições de usuários com score alto têm mais peso
3. **Consenso** — `≥3 trajetos similares (90% de similaridade)` promovem automaticamente uma rota para oficial via cron horário

## Geolocalização

O app usa `navigator.geolocation` (Web API padrão), que funciona em todos os Android via GPS, WiFi positioning ou triangulação de torres. Não há dependência de plugin nativo para localização.

Durante gravação, um **Wake Lock** é ativado para manter a tela ligada e evitar que o browser pause a coleta. Se o usuário minimizar o app, a gravação é pausada automaticamente.
