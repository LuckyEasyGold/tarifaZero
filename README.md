# 🚌 Tarifa Zero

<div align="center">

![Tarifa Zero](https://img.shields.io/badge/Tarifa-Zero-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Sistema de rastreamento de transporte público em tempo real com crowdsourcing**

[Demo](https://tarifazero.vercel.app) · [Documentação](./PLANO_IMPLEMENTACAO.md) · [Reportar Bug](https://github.com/LuckyEasyGold/tarifaZero/issues)

</div>

---

## 📋 Sobre o Projeto

Tarifa Zero é uma plataforma completa de rastreamento de ônibus em tempo real que utiliza **crowdsourcing** para mapear rotas e posições dos veículos. O sistema permite que usuários contribuam com dados GPS enquanto estão no ônibus, criando um mapa colaborativo e preciso do transporte público.

### ✨ Diferenciais

- 🎯 **Crowdsourcing Inteligente**: Usuários contribuem com dados GPS em tempo real
- 📱 **App Nativo Android**: Scanner de Wi-Fi para identificação automática do ônibus
- 🎮 **Gamificação**: Sistema de pontos, níveis, badges e ranking de contribuidores
- 🗺️ **Visualização em Tempo Real**: Acompanhe ônibus e contribuidores no mapa
- 🔒 **Validação por Wi-Fi**: Garante que dados são coletados apenas dentro do ônibus
- 📊 **API RESTful Completa**: Backend robusto com PostgreSQL + PostGIS
- 🎨 **Interface Mobile-First**: Design responsivo e intuitivo

---

## 🚀 Funcionalidades

### Para Usuários

- ✅ Visualizar todas as linhas de ônibus disponíveis
- ✅ Ver rotas completas com paradas no mapa
- ✅ Acompanhar ônibus em tempo real
- ✅ Buscar rotas entre origem e destino (em breve)
- ✅ Contribuir com tracking GPS
- ✅ Ganhar pontos e badges por contribuições
- ✅ Competir no ranking de contribuidores

### Para Desenvolvedores

- ✅ API RESTful documentada
- ✅ Banco de dados PostgreSQL com PostGIS
- ✅ Sistema de inferência de posição
- ✅ Detecção automática de outliers
- ✅ Agregação de dados de múltiplos usuários
- ✅ WebSocket para updates em tempo real (planejado)

---

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Radix UI** (componentes)
- **React Router DOM** (navegação multi-tela)
- **Leaflet** + **React-Leaflet** (mapas)
- **Capacitor** (app nativo Android)

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Prisma ORM**
- **PostgreSQL** (Neon) + **PostGIS**

### DevOps
- **Vercel** (hosting frontend + API)
- **GitHub Actions** (CI/CD)
- **Git** (controle de versão)

---

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- npm ou yarn
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
# Gerar Prisma Client
npm run db:generate

# Criar tabelas
npm run db:push

# Popular com dados iniciais (5 linhas)
npm run db:seed
```

### 5. Execute em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## 🌐 Deploy

### Deploy Web (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Build Android APK

#### Opção 1: GitHub Actions (Recomendado)

O APK é gerado automaticamente a cada push:

1. Acesse: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Baixe o artifact `app-debug`

#### Opção 2: Local (requer Android SDK)

```bash
# Build web
npm run build

# Sincronizar com Android
npx cap sync android

# Gerar APK
cd android
./gradlew assembleDebug
```

APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

📖 [Guia completo de build Android](./ANDROID_BUILD.md)

---

## 📱 Estrutura do Projeto

```
tarifaZero/
├── api/                      # Serverless Functions (Backend)
│   ├── lines/               # Endpoints de linhas
│   ├── stops/               # Endpoints de paradas
│   ├── tracking/            # Endpoints de tracking
│   └── gamification/        # Endpoints de gamificação
├── src/
│   ├── components/          # Componentes React
│   │   ├── map/            # Componentes de mapa
│   │   └── ui/             # Componentes UI (Radix)
│   ├── pages/              # Páginas (rotas)
│   │   ├── Home.tsx        # Mapa principal
│   │   ├── Linhas.tsx      # Lista de linhas
│   │   ├── Contribuir.tsx  # Tracking GPS
│   │   └── Ranking.tsx     # Ranking de usuários
│   ├── hooks/              # Hooks customizados
│   │   ├── useGeolocation.ts
│   │   ├── useWifiScanner.ts
│   │   └── useWifiDetection.ts
│   ├── services/           # Serviços (API calls)
│   ├── data/               # Dados estáticos
│   └── types/              # Tipos TypeScript
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── seed.ts             # Dados iniciais
├── android/                # Projeto Android (Capacitor)
└── public/                 # Assets estáticos
```

---

## 🎮 Sistema de Gamificação

### Pontuação

| Ação | Pontos |
|------|--------|
| Ponto GPS coletado | 1 pt |
| Minuto de tracking | 5 pts |
| Viagem completa | 50 pts |
| Wi-Fi detectado | 100 pts |
| Parada validada | 200 pts |

### Badges

- 🚌 **Primeira Viagem** - Complete 1 viagem
- ⭐ **Passageiro Frequente** - Complete 10 viagens
- 🌟 **Super Passageiro** - Complete 50 viagens
- 📍 **Coletor GPS** - Colete 100 pontos GPS
- 🎯 **Mestre GPS** - Colete 1000 pontos GPS
- 🔥 **Sequência Semanal** - 7 dias consecutivos
- 💎 **Sequência Mensal** - 30 dias consecutivos

### Níveis

- Nível = Pontos ÷ 1000
- Cada nível desbloqueado dá acesso a recursos especiais

---

## 🔌 API Endpoints

### Linhas

```http
GET /api/lines
GET /api/lines/:id
GET /api/lines/:id/map
```

### Paradas

```http
GET /api/stops/nearby?lat=-23.5505&lng=-46.6333&radius=500
```

### Tracking

```http
POST /api/tracking/session
POST /api/tracking/submit
```

### Gamificação

```http
GET /api/gamification/ranking?period=all&limit=10
GET /api/gamification/user?anonymousId=xxx
POST /api/gamification/user
```

📖 [Documentação completa da API](./README_API.md)

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Áreas que precisam de ajuda

- [ ] Implementar busca de rotas (FASE 8)
- [ ] Adicionar WebSocket para tempo real
- [ ] Melhorar algoritmo de inferência
- [ ] Criar testes automatizados
- [ ] Tradução para outros idiomas
- [ ] Documentação de API com Swagger

---

## 📊 Progresso do Projeto

**Status Atual:** 45% Concluído

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Infraestrutura Base | ✅ 100% |
| 2 | Modelagem do Banco | ✅ 100% |
| 3 | API Endpoints Básicos | ✅ 100% |
| 3.5 | Interface Multi-Tela | ✅ 100% |
| 4 | Sistema de Crowdsourcing | 🔄 80% |
| 5 | Identificação de Veículos | ⏸️ 0% |
| 6 | Rastreamento Tempo Real | ⏸️ 0% |
| 7 | Motor de Inferência | ⏸️ 0% |
| 8 | Sistema de Roteamento | ⏸️ 0% |
| 9 | Integração Frontend | 🔄 40% |
| 10 | Testes e Otimização | ⏸️ 0% |

📖 [Plano completo de implementação](./PLANO_IMPLEMENTACAO.md)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**LuckyEasyGold**

- GitHub: [@LuckyEasyGold](https://github.com/LuckyEasyGold)
- Projeto: [Tarifa Zero](https://github.com/LuckyEasyGold/tarifaZero)

---

## 🙏 Agradecimentos

- Comunidade open source
- Contribuidores do projeto
- Usuários que testam e reportam bugs
- Todos que acreditam em transporte público gratuito e acessível

---

<div align="center">

**Desenvolvido com ❤️ para melhorar o transporte público**

[⬆ Voltar ao topo](#-tarifa-zero)

</div>
