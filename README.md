# 🚌 Tarifa Zero

<div align="center">

![Tarifa Zero](https://img.shields.io/badge/Tarifa-Zero-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.1.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Android](https://img.shields.io/badge/Android-13+-brightgreen?style=for-the-badge)

**Sistema colaborativo de rastreamento de transporte público em tempo real**

[Demo](https://tarifazero.vercel.app) · [Download APK](https://github.com/LuckyEasyGold/tarifaZero/releases) · [Reportar Bug](https://github.com/LuckyEasyGold/tarifaZero/issues)

</div>

---

## 📋 Sobre o Projeto

Tarifa Zero é uma plataforma completa de rastreamento de ônibus em tempo real que utiliza **crowdsourcing** para mapear rotas e posições dos veículos. O sistema permite que usuários contribuam com dados GPS enquanto estão no ônibus, criando um mapa colaborativo e preciso do transporte público de Palmas - PR.

### ✨ Diferenciais

- 🎯 **Crowdsourcing Inteligente**: Usuários contribuem com dados GPS em tempo real
- 📱 **App Nativo Android**: Scanner de Wi-Fi para identificação automática do ônibus
- 🔒 **Validação por Wi-Fi**: Garante que dados são coletados apenas dentro do ônibus
- 🎮 **Gamificação**: Sistema de pontos, níveis, badges e ranking de contribuidores
- 🗺️ **Visualização em Tempo Real**: Acompanhe ônibus e colaboradores no mapa
- 📊 **API RESTful Completa**: Backend robusto com PostgreSQL + PostGIS
- 🎨 **Interface Mobile-First**: Design responsivo e intuitivo
- 🔐 **Conformidade LGPD**: Sistema completo de consentimento e privacidade
- 🔔 **Sistema de Atualizações**: Notificação automática de novas versões
- 💛 **Sistema de Doações**: Apoie o projeto via Pix

---

## 🚀 Funcionalidades

### Para Usuários

- ✅ Visualizar todas as linhas de ônibus disponíveis
- ✅ Ver rotas completas com paradas no mapa
- ✅ Acompanhar ônibus em tempo real (simulado)
- ✅ Ver informações detalhadas de cada linha
- ✅ Calcular distância até parada mais próxima
- ✅ Ver tempo estimado de chegada do ônibus
- ✅ Contribuir com mapeamento de rotas (apenas APK)
- ✅ Marcar paradas de ônibus durante gravação
- ✅ Ganhar pontos e badges por contribuições
- ✅ Competir no ranking de contribuidores
- ✅ Ver colaboradores ativos no mapa
- ✅ Receber notificações de atualizações
- ✅ Apoiar o projeto com doações Pix

### Para Desenvolvedores

- ✅ API RESTful documentada
- ✅ Banco de dados PostgreSQL com PostGIS
- ✅ Sistema de inferência de posição
- ✅ Detecção automática de outliers
- ✅ Agregação de dados de múltiplos usuários
- ✅ Sistema de usuários online
- ✅ Endpoints de gamificação
- 🔄 WebSocket para updates em tempo real (planejado)

---

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Radix UI** (componentes)
- **React Router DOM** (navegação multi-tela)
- **Leaflet** + **React-Leaflet** (mapas)
- **Capacitor 8** (app nativo Android)
- **Sonner** (notificações toast)

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Prisma ORM**
- **PostgreSQL** (Neon) + **PostGIS**
- **API consolidada** (1 função para evitar limite)

### DevOps
- **Vercel** (hosting frontend + API)
- **GitHub Actions** (CI/CD automático)
- **Git** (controle de versão)
- **Neon** (PostgreSQL serverless)

---

## 📦 Instalação

### Pré-requisitos

- Node.js 24+
- npm ou yarn
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Conta no [Vercel](https://vercel.com)
- Android Studio (opcional, para build local do APK)
- Java 17 (opcional, para build local do APK)

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
2. Aguarde o build completar (~5-10 min)
3. Baixe o artifact `tarifazero-debug-apk`
4. Extraia o `TarifaZero.apk`

#### Opção 2: GitHub Releases (Versões Estáveis)

Para versões testadas e estáveis:

1. Acesse: https://github.com/LuckyEasyGold/tarifaZero/releases
2. Baixe o `TarifaZero.apk` da última release
3. Instale no Android

#### Opção 3: Local (requer Android SDK + Java 17)

```bash
# Build web
npm run build

# Sincronizar com Android
npx cap sync android

# Gerar APK
cd android
./gradlew assembleDebug
```

APK gerado em: `android/app/build/outputs/apk/debug/TarifaZero.apk`

📖 [Guia completo: GERENCIAMENTO_VERSOES.md](./GERENCIAMENTO_VERSOES.md)

---

## 📱 Estrutura do Projeto

```
tarifaZero/
├── api/                      # Backend consolidado (1 função)
│   └── index.js             # Todos os endpoints
├── src/
│   ├── components/          # Componentes React
│   │   ├── map/            # Componentes de mapa
│   │   ├── ui/             # Componentes UI (Radix)
│   │   ├── UpdateNotification.tsx  # Notificação de atualização
│   │   ├── DownloadAppModal.tsx    # Modal para baixar APK
│   │   ├── RecordingBanner.tsx     # Banner de gravação
│   │   └── MarkStopModal.tsx       # Modal para marcar paradas
│   ├── pages/              # Páginas (rotas)
│   │   ├── Home.tsx        # Mapa principal + modo gravação
│   │   ├── Linhas.tsx      # Lista de linhas
│   │   ├── Contribuir.tsx  # Seleção de linha + WiFi
│   │   ├── Ranking.tsx     # Ranking de usuários
│   │   └── Sobre.tsx       # Sobre + contato + apoiadores
│   ├── hooks/              # Hooks customizados
│   │   ├── useGeolocation.ts
│   │   └── useWifiScanner.ts
│   ├── services/           # Serviços (API calls)
│   ├── data/               # Dados estáticos
│   └── types/              # Tipos TypeScript
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── seed.ts             # Dados iniciais
├── android/                # Projeto Android (Capacitor)
│   └── app/src/main/java/com/newsdrop/tarifazero/
│       └── WifiScannerPlugin.java  # Plugin WiFi Scanner
├── public/                 # Assets estáticos
│   └── version.json        # Informações de versão
└── scripts/                # Scripts utilitários
    └── seed-supporters.js  # Inserir contribuidores
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

### Usuários Online

```http
GET /api/users/active
POST /api/users/heartbeat
POST /api/users/create
```

### Contribuidores

```http
GET /api/supporters
POST /api/supporters
```

### Versionamento

```http
GET /api/version
```

📖 [Documentação completa da API](./README_API.md)

---

## 🎨 Funcionalidades Recentes

### v2.1.0 (30/03/2026) - Atual ✅

**Sistema de Versionamento e Atualizações**
- Notificação automática de novas versões no app
- Endpoint `/api/version` para verificar atualizações
- Suporte para atualizações opcionais e obrigatórias
- GitHub Releases para distribuição de versões estáveis

**Sistema de Contribuidores e Doações**
- Card "Quem já contribuiu" na página Sobre
- Tabela `supporters` no banco de dados
- Chave Pix para doações (46991966464)
- Links para redes sociais dos apoiadores

**Melhorias no WiFi Scanner**
- Suporte completo para Android 13+ (permissão NEARBY_WIFI_DEVICES)
- Fallback para cache quando scan falha
- Logs detalhados para debug
- Mensagens de erro específicas e amigáveis

**Página Sobre Completa**
- Perfil do desenvolvedor
- Edição de nickname
- Visualização de ID anônimo
- Contato (email e WhatsApp)
- Lista de apoiadores
- Link para Política de Privacidade

**GitHub Actions Corrigido**
- Build automático do APK a cada push
- Nome correto do APK (TarifaZero.apk)
- Verificações de build melhoradas
- Artifacts disponíveis para download

### v2.0.0 - Modo Gravação de Rotas ✅

**Gravação de Rotas (apenas APK)**
- Validação de WiFi do ônibus antes de gravar
- Modo gravação na página Home (mapa existente)
- Banner vermelho com tempo, pontos GPS e precisão
- Botões flutuantes para marcar paradas e finalizar
- Modal para nomear paradas com sugestões

**Sistema de Paradas**
- Marcação de paradas durante gravação
- Campo `name` para identificar paradas
- Armazenamento em `TempStop` para processamento posterior

**Restrições de Contribuição**
- Apenas APK pode contribuir (não browser/PWA)
- Modal explicativo no browser com link para download
- Validação obrigatória de WiFi do ônibus

### v1.0.0 - Base do Sistema ✅

**Tela de Boas-Vindas e LGPD**
- Splash screen com vídeo animado
- Consentimento obrigatório conforme LGPD
- Campo opcional para nome/apelido
- Página completa de Política de Privacidade
- Geração de ID anônimo único por dispositivo

**Sistema de Usuários Online**
- Visualização de colaboradores ativos no mapa
- Cores únicas por usuário
- Informações de nível e pontos
- Heartbeat automático a cada 30s
- Marcadores personalizados no mapa

**Detalhes de Linha Avançados**
- Informações em tempo real do ônibus (posição, sentido, velocidade)
- Cálculo da parada mais próxima do usuário
- Distância e tempo caminhando até a parada
- Tempo estimado até ônibus chegar
- Botão "Ver no Mapa" com filtro de linha
- Navegação integrada entre telas

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Áreas que precisam de ajuda

- [ ] Implementar busca de rotas (origem → destino)
- [ ] Adicionar WebSocket para tempo real
- [ ] Melhorar algoritmo de inferência de posição
- [ ] Criar testes automatizados (Jest/Vitest)
- [ ] Tradução para outros idiomas (i18n)
- [ ] Documentação de API com Swagger/OpenAPI
- [ ] Modo escuro (dark mode)
- [ ] Notificações push
- [ ] Histórico de viagens do usuário

---

## 📊 Progresso do Projeto

**Status Atual:** 75% Concluído

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Infraestrutura Base | ✅ 100% |
| 2 | Modelagem do Banco | ✅ 100% |
| 3 | API Endpoints Básicos | ✅ 100% |
| 4 | Interface Multi-Tela | ✅ 100% |
| 5 | Sistema de Crowdsourcing | ✅ 100% |
| 6 | Tela de Boas-Vindas e LGPD | ✅ 100% |
| 7 | Sistema de Usuários Online | ✅ 100% |
| 8 | Detalhes de Linha Avançados | ✅ 100% |
| 9 | Modo Gravação de Rotas | ✅ 100% |
| 10 | Sistema de Versionamento | ✅ 100% |
| 11 | Sistema de Contribuidores | ✅ 100% |
| 12 | Identificação de Veículos | ⏸️ 0% |
| 13 | Motor de Inferência Avançado | ⏸️ 0% |
| 14 | Sistema de Roteamento | ⏸️ 0% |
| 15 | Testes e Otimização | ⏸️ 0% |

📖 [Documentação completa: DOCUMENTACAO_COMPLETA.md](./DOCUMENTACAO_COMPLETA.md)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Vinícius Ribeiro Ramos**

- GitHub: [@LuckyEasyGold](https://github.com/LuckyEasyGold)
- Email: viniciusribramos@gmail.com
- WhatsApp: (42) 99106-6464
- Projeto: [Tarifa Zero](https://github.com/LuckyEasyGold/tarifaZero)
- Localização: Palmas - PR, Brasil

---

## 🙏 Agradecimentos

- Comunidade open source
- Contribuidores do projeto
- Apoiadores via Pix: Marcos Dieison, Din0, Leticia, Claudio
- Usuários que testam e reportam bugs
- Todos que acreditam em transporte público gratuito e acessível

### 💛 Apoie o Projeto

Se o Tarifa Zero te ajuda no dia a dia, considere contribuir:

**Chave Pix**: 46991966464 (Vinícius Ribeiro Ramos)

Sua contribuição ajuda a cobrir custos de servidores, GPS e desenvolvimento!

---

<div align="center">

**Desenvolvido com ❤️ para melhorar o transporte público**

[⬆ Voltar ao topo](#-tarifa-zero)

</div>
