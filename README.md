# 🚌 Tarifa Zero

<div align="center">

![Tarifa Zero](https://img.shields.io/badge/Tarifa-Zero-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.5.0.14-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Android](https://img.shields.io/badge/Android-7%2B-brightgreen?style=for-the-badge)

**Sistema colaborativo de rastreamento de transporte público em tempo real**

[Demo](https://tarifazero.vercel.app) · [Download APK](https://tarifazero.vercel.app/tarifazero.apk) · [Reportar Bug](https://github.com/LuckyEasyGold/tarifaZero/issues)

</div>

---

## 📋 Sobre o Projeto

Tarifa Zero é uma plataforma de rastreamento de ônibus em tempo real que usa **crowdsourcing** para mapear rotas e posições dos veículos. Usuários contribuem com dados GPS enquanto estão no ônibus, criando um mapa colaborativo do transporte público de Palmas - PR.

### ✨ Diferenciais

- 🎯 **Crowdsourcing com validação** — trajetos passam por 3 camadas antes de virar rota oficial
- 🛡️ **Detecção automática** — o sistema identifica se o usuário estava em um ônibus ou carro
- 🤝 **Consenso espacial** — rotas verificadas por ≥3 usuários independentes
- 🏆 **Trust score progressivo** — contribuidores frequentes têm mais peso no sistema
- 🎮 **Gamificação** — pontos, níveis, badges e ranking
- 🗺️ **Mapa em tempo real** — visualize ônibus e colaboradores ativos
- 📱 **App Android nativo** — via Capacitor, com scanner de WiFi para identificar o ônibus
- 🔔 **Atualizações automáticas** — notificação e instalação de novas versões no app
- 💛 **Apoio via Pix** — sustentado pela comunidade

---

## 🚀 Funcionalidades

### Para Usuários

- ✅ Visualizar linhas de ônibus e rotas no mapa
- ✅ Acompanhar posição simulada dos ônibus em tempo real
- ✅ Ver horários e paradas de cada linha
- ✅ Calcular distância e tempo até a parada mais próxima
- ✅ Contribuir com gravação de rotas (app Android)
- ✅ Marcar paradas durante a gravação
- ✅ Ganhar pontos e badges por contribuições
- ✅ Ver colaboradores ativos no mapa
- ✅ Receber notificações de novas versões com instalação automática
- ✅ Apoiar o projeto com doações Pix

### Para Desenvolvedores

- ✅ API RESTful documentada
- ✅ PostgreSQL + PostGIS para dados geoespaciais
- ✅ Validação client-side de padrão de movimento (ônibus vs carro)
- ✅ Sistema de trust score e reputação
- ✅ Clustering espacial de trajetos para consenso
- ✅ Cron horário para validação automática de rotas
- ✅ Plugin nativo Android para instalação de APK
- ✅ Plugin nativo Android para scanner de WiFi

---

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript** + **Vite 7**
- **Tailwind CSS** + **Radix UI**
- **React Router DOM v7**
- **Leaflet** + **React-Leaflet**
- **Capacitor 8** (app nativo Android)
- **Sonner** (notificações toast)

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Prisma ORM 5**
- **PostgreSQL + PostGIS** (Neon)

### DevOps
- **Vercel** (hosting frontend + API)
- **GitHub Actions** (CI/CD — APK gerado automaticamente a cada push)
- **Neon** (PostgreSQL serverless)

---

## 📦 Instalação

### Pré-requisitos

- Node.js 24+
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Conta no [Vercel](https://vercel.com)

### 1. Clone o repositório

```bash
git clone https://github.com/LuckyEasyGold/tarifaZero.git
cd tarifaZero
```

### 2. Instale as dependências

```bash
npm install --legacy-peer-deps
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 4. Configure o banco de dados

```bash
npm run db:generate   # Gera o Prisma Client
npm run db:push       # Cria as tabelas
npm run db:seed       # Popula com as 5 linhas de Palmas-PR
```

### 5. Execute em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## 🌐 Deploy

### Web (Vercel)

```bash
vercel --prod
```

### APK Android

O APK é gerado automaticamente pelo GitHub Actions a cada push na `main`:

1. Acesse: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Baixe o artifact do build mais recente

Ou baixe a versão estável diretamente: https://tarifazero.vercel.app/tarifazero.apk

Para build local (requer Android Studio + Java 17):

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## 📱 Estrutura do Projeto

```
tarifaZero/
├── api/                    # Backend (Vercel Serverless)
│   ├── index.js           # Roteador principal
│   ├── trajectories/      # Gravação de trajetos
│   └── admin/             # Validação automática (cron)
├── src/
│   ├── components/        # Componentes React
│   │   └── map/           # Mapa e ícones
│   ├── pages/             # Páginas da aplicação
│   ├── hooks/             # useGeolocation, useWifiDetection
│   ├── services/          # trackingService, reputation, clusterRoutes
│   └── lib/               # trackValidator (detecção ônibus vs carro)
├── prisma/
│   ├── schema.prisma      # Schema completo do banco
│   └── seed.ts            # Dados iniciais
├── android/               # Projeto Android (Capacitor)
│   └── app/src/main/java/com/newsdrop/tarifazero/
│       ├── WifiScannerPlugin.java
│       ├── ApkInstallerPlugin.java
│       └── MainActivity.java
├── public/
│   ├── version.json       # Versão atual (para notificação de update)
│   └── tarifazero.apk     # APK mais recente
└── docs/                  # Documentação para contribuidores
    ├── ARQUITETURA.md
    └── CONTRIBUINDO.md
```

---

## 🎮 Sistema de Gamificação

### Pontuação

| Ação | Pontos |
|------|--------|
| Ponto GPS coletado | 1 pt |
| Minuto de tracking | 5 pts |
| Viagem completa | 50 pts |
| WiFi do ônibus detectado | 100 pts |
| Parada validada | 200 pts |

### Badges

- 🚌 **Primeira Viagem** — Complete 1 viagem
- ⭐ **Passageiro Frequente** — Complete 10 viagens
- 🌟 **Super Passageiro** — Complete 50 viagens
- 📍 **Coletor GPS** — Colete 100 pontos GPS
- 🎯 **Mestre GPS** — Colete 1000 pontos GPS
- 🔥 **Sequência Semanal** — 7 dias consecutivos
- 💎 **Sequência Mensal** — 30 dias consecutivos

---

## 🔌 API Endpoints

### Linhas
```http
GET /api/lines
GET /api/lines/:id
GET /api/lines/:id/schedules
GET /api/lines/:id/trajectories?status=verified&limit=50
```

### Gravação de Trajetos
```http
POST /api/trajectories/start
POST /api/trajectories/point
POST /api/trajectories/stop-mark
POST /api/trajectories/stop
```

### Gamificação
```http
GET  /api/gamification/ranking?period=all&limit=10
GET  /api/gamification/user?anonymousId=xxx
POST /api/gamification/user
```

### Usuários Online
```http
GET  /api/users/active
POST /api/users/heartbeat
POST /api/users/create
```

### Outros
```http
GET  /api/supporters
GET  /api/version
POST /api/admin/validate-routes   # Cron horário (Vercel)
```

📖 [Documentação completa da API](./README_API.md)

---

## 📊 Progresso do Projeto

**Status Atual:** 90% Concluído

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Infraestrutura Base | ✅ 100% |
| 2 | Modelagem do Banco | ✅ 100% |
| 3 | API Endpoints | ✅ 100% |
| 4 | Interface Multi-Tela | ✅ 100% |
| 5 | Sistema de Crowdsourcing | ✅ 100% |
| 6 | Boas-Vindas e LGPD | ✅ 100% |
| 7 | Usuários Online | ✅ 100% |
| 8 | Detalhes de Linha | ✅ 100% |
| 9 | Modo Gravação de Rotas | ✅ 100% |
| 10 | Sistema de Versionamento | ✅ 100% |
| 11 | Sistema de Contribuidores | ✅ 100% |
| 12 | Validação em Camadas | ✅ 100% |
| 13 | Trust Score e Reputação | ✅ 100% |
| 14 | Clustering Espacial | ✅ 100% |
| 15 | Instalação Automática APK | ✅ 100% |
| 16 | Rotas Colaborativas (consenso) | ✅ 100% |
| 17 | Identificação de Veículos | ⏸️ 0% |
| 18 | Motor de Inferência Avançado | ⏸️ 0% |
| 19 | Busca de Rotas (origem→destino) | ⏸️ 0% |
| 20 | Testes Automatizados | ⏸️ 0% |

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Veja o guia completo em [docs/CONTRIBUINDO.md](./docs/CONTRIBUINDO.md).

### Áreas que precisam de ajuda

- [ ] Busca de rotas (origem → destino)
- [ ] WebSocket para tempo real
- [ ] Testes automatizados (Vitest)
- [ ] Tradução para outros idiomas (i18n)
- [ ] Documentação de API com Swagger
- [ ] Modo escuro
- [ ] Notificações push
- [ ] Histórico de viagens do usuário

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

**Vinícius Ribeiro Ramos**

- GitHub: [@LuckyEasyGold](https://github.com/LuckyEasyGold)
- Email: viniciusribramos@gmail.com
- WhatsApp: (42) 99106-6464
- Localização: Palmas - PR, Brasil

---

## 🙏 Agradecimentos

- Contribuidores do projeto
- Apoiadores via Pix: Marcos Dieison, Din0, Leticia, Claudio
- Comunidade open source

### 💛 Apoie o Projeto

**Chave Pix**: 46991966464 (Vinícius Ribeiro Ramos)

---

<div align="center">

**Desenvolvido com ❤️ para melhorar o transporte público**

[⬆ Voltar ao topo](#-tarifa-zero)

</div>
