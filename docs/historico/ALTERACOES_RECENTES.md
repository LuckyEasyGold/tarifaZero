# Tarifa Zero — Estado Atual do Projeto
> Atualizado em: 30/03/2026 | Versão: 2.1

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite 7 + TailwindCSS |
| Mobile | Capacitor 8 (Android) |
| Backend | Node.js serverless (Vercel Functions) |
| Banco | PostgreSQL + PostGIS (Neon) |
| ORM | Prisma 5 |
| Deploy Web | Vercel |
| Deploy APK | GitHub Actions → artifact |

---

## Páginas / Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Home` | Mapa com posições dos ônibus e usuários ativos |
| `/linhas` | `Linhas` | Lista de linhas disponíveis |
| `/linha/:id` | `LinhaDetalhes` | Detalhes de uma linha (rota, paradas) |
| `/buscar` | `BuscarRota` | Busca de rota origem → destino |
| `/contribuir` | `Contribuir` | Fluxo de tracking + identificação por Wi-Fi |
| `/ranking` | `Ranking` | Gamificação — ranking de contribuidores |
| `/sobre` | `Sobre` | Perfil do criador, Pix, apoiadores, LGPD |
| `/politica-privacidade` | `PoliticaPrivacidade` | Termos e política de privacidade |

---

## API Endpoints (`/api/*`)

### Linhas
- `GET /api/lines` — lista todas as linhas
- `GET /api/lines/:id` — detalhes de uma linha (com rotas e paradas)

### Paradas
- `GET /api/stops/nearby?lat&lng&radius` — paradas próximas (PostGIS)
- `POST /api/stops/mark` — marcar parada temporária durante tracking

### Tracking
- `POST /api/tracking/session` — iniciar/encerrar sessão de tracking
- `POST /api/tracking/submit` — enviar lote de pontos GPS

### Usuários
- `POST /api/users/create` — criar/atualizar usuário (upsert por anonymousId)
- `GET /api/users/active` — usuários online nos últimos 5 min
- `POST /api/users/heartbeat` — atualizar posição e status online

### Wi-Fi
- `POST /api/wifi/save` — salvar rede Wi-Fi associada a uma linha
- `POST /api/wifi/identify` — identificar linha pelo SSID/BSSID

### Gamificação
- `GET /api/gamification/ranking?period&limit` — ranking de usuários
- `GET /api/gamification/user?anonymousId` — dados de um usuário
- `POST /api/gamification/user` — atualizar pontos/nickname

### Apoiadores
- `GET /api/supporters` — lista apoiadores ativos
- `POST /api/supporters` — adicionar apoiador (uso interno)

---

## Banco de Dados (Prisma + PostGIS)

| Tabela | Descrição |
|---|---|
| `users` | Usuários anônimos com pontos, nível, badges, posição atual |
| `lines` | Linhas de ônibus (código, cor, horários) |
| `routes` | Rotas ida/volta por linha |
| `route_points` | Pontos do shape da rota (sequência lat/lng) |
| `stops` | Paradas oficiais por linha |
| `trips` | Viagens agendadas/realizadas |
| `vehicle_positions` | Posições crowdsourced dos ônibus |
| `user_tracks` | Pontos GPS enviados pelos usuários |
| `wifi_networks` | Redes Wi-Fi associadas a linhas (SSID/BSSID) |
| `temp_stops` | Paradas marcadas durante tracking (aguardam validação) |
| `supporters` | Apoiadores do projeto (exibidos na página Sobre) |
| `speed_stats` | Velocidade média por trecho/horário (aprendizado) |

---

## Mobile (Capacitor + Android)

- App ID: `com.newsdrop.tarifazero`
- Plugin nativo customizado: `WifiScannerPlugin.java` — escaneia redes Wi-Fi
- Permissões: `ACCESS_FINE_LOCATION`, `ACCESS_WIFI_STATE`, `NEARBY_WIFI_DEVICES` (Android 13+)
- Build: Java 17 + Gradle
- Servidor: aponta para `https://tarifazero.vercel.app`

---

## CI/CD

### Vercel (web)
- Deploy automático no push para `main`
- Build: `npm run build` (Vite)
- Variáveis necessárias: `DATABASE_URL`

### GitHub Actions (APK)
- Arquivo: `.github/workflows/android-build.yml`
- Trigger: push em `main` ou manual (`workflow_dispatch`)
- Node 24 + Java 17 + Gradle
- Gera `app-debug.apk` disponível como artifact por 30 dias

---

## Funcionalidades Implementadas

- Splash screen + tela de boas-vindas com aceite de termos (LGPD)
- Geração de ID anônimo único por usuário
- Mapa interativo (Leaflet) com posições simuladas dos ônibus
- Modo gravação de rota com envio de pontos GPS em tempo real
- Identificação de linha por rede Wi-Fi (SSID/BSSID) no app nativo
- Ranking de contribuidores com badges e níveis
- Heartbeat de presença (usuários ativos no mapa)
- Marcação de paradas temporárias durante tracking
- Página Sobre com perfil, Pix, apoiadores e LGPD
- PWA install prompt
- Favicon configurado

---

## Pendente / Próximos Passos

- Ícone personalizado do app Android (substituir mipmap-*)
- Motor de inferência de posição quando sem dados recentes
- Validação e promoção de `temp_stops` para paradas oficiais
- Endpoint `POST /route/search` (roteador origem → destino)
- Sistema de velocidade média por trecho (`speed_stats`)
- Notificações push (chegada do ônibus)
- Deploy de APK de release assinado (keystore)

---

## Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build web
npm run build

# Sincronizar e abrir Android Studio
npm run android:sync
npm run android:open

# Banco de dados
npm run db:studio      # Prisma Studio
npm run db:push        # Aplicar schema
npm run db:seed        # Popular dados iniciais
```
