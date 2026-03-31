# Tarifa Zero - Guia Técnico Completo para IA

**Versão**: 2.1.0  
**Data**: 30/03/2026  
**Tipo**: Sistema de rastreamento de transporte público colaborativo  
**Desenvolvedor**: Vinícius Ribeiro Ramos (viniciusribramos@gmail.com)

---

## 🎯 CONTEXTO DO PROJETO

### Objetivo
Sistema colaborativo de rastreamento de ônibus em tempo real usando crowdsourcing. Usuários contribuem com dados GPS enquanto estão no ônibus, validados por WiFi do veículo.

### Localização
Palmas - PR, Brasil

### Problema Resolvido
- Falta de informações em tempo real sobre transporte público
- Ausência de acesso oficial ao GPS dos veículos
- Necessidade de validar que usuários estão realmente no ônibus

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Principal
- **Frontend**: React 18 + TypeScript + Vite 7 + Tailwind CSS
- **Mobile**: Capacitor 8 (Android nativo)
- **Backend**: Node.js Serverless (Vercel Functions)
- **Banco**: PostgreSQL + PostGIS (Neon)
- **ORM**: Prisma 5
- **Deploy**: Vercel (web) + GitHub Actions (APK)

### Estrutura de Pastas
```
tarifaZero/
├── api/index.js              # Backend consolidado (TODOS os endpoints)
├── src/
│   ├── components/           # Componentes React
│   ├── pages/                # Páginas (Home, Linhas, Contribuir, etc)
│   ├── hooks/                # useGeolocation, useWifiScanner
│   ├── services/             # API calls
│   └── types/                # TypeScript types
├── android/                  # Projeto Android (Capacitor)
│   └── app/src/main/java/com/newsdrop/tarifazero/
│       └── WifiScannerPlugin.java  # Plugin WiFi Scanner
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   └── seed.ts               # Dados iniciais (5 linhas)
└── public/
    └── version.json          # Info de versão para atualizações
```


---

## 🗄️ BANCO DE DADOS (PostgreSQL + PostGIS)

### Tabelas Principais

**users** - Usuários do sistema
- `anonymousId` (unique) - ID único gerado no primeiro acesso
- `nickname` - Nome/apelido opcional
- `points`, `level`, `totalTrips` - Gamificação
- `currentLat`, `currentLng` - Posição atual
- `isOnline`, `isTracking` - Status
- `acceptedTerms`, `acceptedTermsDate` - LGPD

**lines** - Linhas de ônibus
- `code` - Código da linha (ex: "001")
- `name` - Nome da linha
- `color`, `colorHex` - Cores para visualização
- `startTime`, `endTime`, `intervalMin` - Horários

**routes** - Rotas (ida/volta)
- `lineId` - Referência à linha
- `direction` - "ida" ou "volta"
- `name` - Nome da rota

**route_points** - Pontos da rota (shape)
- `routeId` - Referência à rota
- `sequence` - Ordem do ponto
- `lat`, `lng` - Coordenadas

**stops** - Paradas de ônibus
- `lineId` - Referência à linha
- `code` - Código da parada
- `name` - Nome da parada
- `lat`, `lng` - Coordenadas

**user_tracks** - Tracking GPS dos usuários
- `userId`, `sessionId` - Identificação
- `lineId` - Linha sendo rastreada
- `lat`, `lng`, `speed`, `heading`, `accuracy` - Dados GPS
- `timestamp` - Momento da coleta

**wifi_networks** - Redes WiFi dos ônibus
- `lineId` - Linha associada
- `ssid` - Nome da rede
- `bssid` - MAC address (identificador único)
- `active` - Se está ativa

**temp_stops** - Paradas temporárias (marcadas durante gravação)
- `lineId` - Linha
- `lat`, `lng` - Coordenadas
- `sessionId` - Sessão de gravação
- `name` - Nome da parada

**supporters** - Apoiadores do projeto
- `name` - Nome do apoiador
- `socialUrl` - Link Instagram/Facebook
- `socialLabel` - "Instagram" ou "Facebook"
- `active` - Se deve aparecer no app


---

## 🔌 API ENDPOINTS (api/index.js)

### Linhas
- `GET /api/lines` - Lista todas as linhas
- `GET /api/lines/:id` - Detalhes de uma linha (com rotas e paradas)

### Paradas
- `GET /api/stops/nearby?lat&lng&radius` - Paradas próximas (PostGIS)
- `POST /api/stops/mark` - Marcar parada temporária durante tracking

### Tracking
- `POST /api/tracking/session` - Iniciar/encerrar sessão de tracking
- `POST /api/tracking/submit` - Enviar lote de pontos GPS

### Usuários
- `POST /api/users/create` - Criar/atualizar usuário (upsert por anonymousId)
- `GET /api/users/active` - Usuários online nos últimos 5 min
- `POST /api/users/heartbeat` - Atualizar posição e status online

### WiFi
- `POST /api/wifi/save` - Salvar rede WiFi associada a uma linha
- `POST /api/wifi/identify` - Identificar linha pelo SSID/BSSID

### Gamificação
- `GET /api/gamification/ranking?period&limit` - Ranking de usuários
- `GET /api/gamification/user?anonymousId` - Dados de um usuário
- `POST /api/gamification/user` - Atualizar pontos/nickname

### Apoiadores
- `GET /api/supporters` - Lista apoiadores ativos
- `POST /api/supporters` - Adicionar apoiador (uso interno)

### Versionamento
- `GET /api/version` - Informações da versão mais recente (para notificação de atualização)


---

## 📱 PÁGINAS E ROTAS

### Navegação Principal (BottomNav)
- `/` - Home (Mapa)
- `/linhas` - Lista de Linhas
- `/buscar` - Buscar Rota
- `/contribuir` - Contribuir
- `/ranking` - Ranking

### Páginas Detalhadas

**Home (`/`)**
- Mapa interativo com Leaflet
- Posições simuladas dos ônibus
- Usuários ativos no mapa
- **Modo Gravação**: Ativado via query params `?recording=true&lineId=xxx&sessionId=yyy`
  - Banner vermelho no topo (tempo, pontos GPS, precisão)
  - Botão flutuante "Marcar Parada" (direita)
  - Botão flutuante "Finalizar" (esquerda)
  - Modal para nomear paradas

**Linhas (`/linhas`)**
- Lista todas as linhas disponíveis
- Card por linha com código, nome, cor
- Clique vai para `/linha/:id`

**Linha Detalhes (`/linha/:id`)**
- Informações da linha
- Rota completa no mapa
- Paradas marcadas
- Botão "Ver no Mapa" (vai para Home com filtro)

**Contribuir (`/contribuir`)**
- **Browser/PWA**: Mostra modal explicando que precisa do app Android
- **APK**: 
  1. Seleciona linha
  2. Scanner WiFi automático
  3. Card com redes WiFi detectadas
  4. Usuário escolhe WiFi do ônibus
  5. Botão "Iniciar Criação de Rota" fica ativo
  6. Redireciona para Home em modo gravação

**Ranking (`/ranking`)**
- Top 10 contribuidores
- Pontos, nível, badges
- Posição do usuário atual

**Sobre (`/sobre`)**
- Perfil do desenvolvedor
- Edição de nickname
- Visualização de ID anônimo
- Contato (email e WhatsApp)
- Chave Pix para doações
- Lista de apoiadores
- Link para Política de Privacidade
- Botão "Fechar App"

**Política de Privacidade (`/politica-privacidade`)**
- Termos completos
- Conformidade LGPD
- Dados coletados
- Direitos do usuário


---

## 🔧 FUNCIONALIDADES PRINCIPAIS

### 1. Sistema de Crowdsourcing

**Fluxo Completo**:
1. Usuário abre app (APK)
2. Vai em "Contribuir"
3. Seleciona linha do ônibus
4. Scanner WiFi detecta redes automaticamente
5. Usuário escolhe WiFi do ônibus (valida que está no veículo)
6. Clica "Iniciar Criação de Rota"
7. Redireciona para Home em modo gravação
8. GPS coleta pontos automaticamente
9. Usuário pode marcar paradas com nome
10. Ao finalizar, dados são salvos no banco

**Validações**:
- ✅ Apenas APK pode contribuir (não browser)
- ✅ WiFi do ônibus deve ser validado
- ✅ Permissão de localização necessária
- ✅ Dados enviados com sessionId único

### 2. WiFi Scanner (Android)

**Plugin Nativo**: `WifiScannerPlugin.java`

**Funcionalidades**:
- Escaneia redes WiFi próximas
- Suporte Android 13+ (permissão NEARBY_WIFI_DEVICES)
- Fallback para cache quando scan falha
- Retorna: SSID, BSSID, level (sinal), frequency

**Permissões Necessárias**:
- Android < 13: `ACCESS_FINE_LOCATION`
- Android 13+: `NEARBY_WIFI_DEVICES`
- Sempre: `ACCESS_WIFI_STATE`, `CHANGE_WIFI_STATE`

### 3. Sistema de Gamificação

**Pontuação**:
- 1 pt por ponto GPS coletado
- 5 pts por minuto de tracking
- 50 pts por viagem completa
- 100 pts por WiFi detectado
- 200 pts por parada validada

**Níveis**:
- Nível = Pontos ÷ 1000
- Cada nível desbloqueado dá acesso a recursos especiais

**Badges**:
- 🚌 Primeira Viagem (1 viagem)
- ⭐ Passageiro Frequente (10 viagens)
- 🌟 Super Passageiro (50 viagens)
- 📍 Coletor GPS (100 pontos)
- 🎯 Mestre GPS (1000 pontos)

### 4. Sistema de Versionamento

**Arquivos de Versão** (4 lugares):
1. `package.json` → `"version": "2.1.0"`
2. `android/app/build.gradle` → `versionCode 2, versionName "2.1.0"`
3. `public/version.json` → versão + changelog
4. `api/index.js` → endpoint `/api/version`

**Notificação de Atualização**:
- Componente `UpdateNotification.tsx`
- Verifica versão ao abrir app (apenas APK)
- Compara `versionCode` local vs servidor
- Mostra banner se houver atualização
- Link direto para GitHub Release

**Tipos de Atualização**:
- **Opcional** (`forceUpdate: false`): Usuário pode dispensar
- **Obrigatória** (`forceUpdate: true`): Deve atualizar para continuar


---

## 🚀 DEPLOY E CI/CD

### Vercel (Web + API)
- **Trigger**: Push automático em `main`
- **Build**: `npm run build` (Vite)
- **Variáveis**: `DATABASE_URL`
- **URL**: https://tarifazero.vercel.app

### GitHub Actions (APK)
- **Arquivo**: `.github/workflows/android-build.yml`
- **Trigger**: Push em `main` ou manual
- **Node**: 24
- **Java**: 17
- **Gradle**: 8.x
- **Output**: `TarifaZero.apk` (artifact por 30 dias)
- **Duração**: ~5-10 minutos

**Processo**:
1. Checkout código
2. Setup Node.js 24 + Java 17
3. Instalar dependências
4. Gerar Prisma Client
5. Build web (`npm run build`)
6. Sync Capacitor
7. Build APK com Gradle
8. Upload artifact

### GitHub Releases (Versões Estáveis)
- **Quando**: Após testar APK completamente
- **Tag**: `v2.1.0`
- **Anexo**: `TarifaZero.apk` testado
- **Changelog**: Lista de mudanças
- **URL**: Usado no `downloadUrl` do version.json

---

## 📝 COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run dev                 # Servidor dev (localhost:5173)
npm run build              # Build produção
npm run preview            # Preview do build
```

### Banco de Dados
```bash
npm run db:generate        # Gerar Prisma Client
npm run db:push            # Aplicar schema (sem migrations)
npm run db:migrate         # Criar migration
npm run db:studio          # Abrir Prisma Studio
npm run db:seed            # Popular dados iniciais (5 linhas)
```

### Android
```bash
npm run android:sync       # Build web + sync Capacitor
npm run android:open       # Abrir Android Studio
npm run android:build      # Build completo + APK

# Ou manual:
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

### Git
```bash
git add .
git commit -m "feat: descrição"
git push origin main
```


---

## 🔍 TROUBLESHOOTING COMUM

### Build do GitHub Actions Falha

**Erro**: "Java home supplied is invalid"
- **Causa**: `android/gradle.properties` tem caminho local do Java
- **Solução**: Remover linha `org.gradle.java.home=...`

**Erro**: "dist folder not found"
- **Causa**: Build do Vite falhou
- **Solução**: Verificar erros de TypeScript, executar `npm run build` localmente

**Erro**: "APK not found"
- **Causa**: Build do Gradle falhou
- **Solução**: Verificar logs do Gradle, testar `cd android && ./gradlew assembleDebug`

### WiFi Scanner Não Funciona

**Problema**: Nenhuma rede detectada
- **Causa 1**: WiFi desligado
- **Solução**: Ligar WiFi no celular

- **Causa 2**: Permissões não concedidas
- **Solução**: Configurações → Apps → Tarifa Zero → Permissões → Localização (Sempre permitir)

- **Causa 3**: Android 13+ sem permissão NEARBY_WIFI_DEVICES
- **Solução**: Atualizar para versão 2.1.0+

**Logs**: `adb logcat | grep -i wifi`

### Notificação de Atualização Não Aparece

**Problema**: Usuário não vê banner de atualização
- **Causa 1**: Está no browser (não no APK)
- **Solução**: Notificação só funciona no app nativo

- **Causa 2**: `versionCode` não foi incrementado
- **Solução**: Verificar se versionCode no servidor > local

- **Causa 3**: API `/api/version` não atualizada
- **Solução**: Atualizar `api/index.js` com nova versão

### Banco de Dados

**Erro**: "Table does not exist"
- **Solução**: `npm run db:push`

**Erro**: "Prisma Client not generated"
- **Solução**: `npm run db:generate`

**Erro**: "Connection refused"
- **Solução**: Verificar `DATABASE_URL` no `.env`


---

## 📚 DOCUMENTAÇÃO ADICIONAL

### Arquivos de Documentação
- `README.md` - Visão geral do projeto
- `GERENCIAMENTO_VERSOES.md` - Como liberar novas versões
- `COMO_ADICIONAR_CONTRIBUIDORES.md` - Como adicionar apoiadores
- `DEBUG_GITHUB_ACTIONS.md` - Debug do CI/CD
- `DOCUMENTACAO_COMPLETA.md` - Este documento consolidado

### Recursos Externos
- **Vercel**: https://vercel.com/docs
- **Capacitor**: https://capacitorjs.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Leaflet**: https://leafletjs.com/reference.html
- **PostGIS**: https://postgis.net/documentation/

---

## 🎯 REGRAS IMPORTANTES PARA IA

### Ao Fazer Mudanças

1. **Sempre testar localmente** antes de commitar
2. **Atualizar versão** se mudança significativa (4 arquivos)
3. **Não commitar** configurações locais (gradle.properties, .env)
4. **Usar TypeScript** corretamente (tipos explícitos)
5. **Seguir padrões** do projeto (Tailwind, componentes Radix)

### Ao Criar Novas Funcionalidades

1. **Backend**: Adicionar endpoint em `api/index.js`
2. **Frontend**: Criar componente em `src/components/` ou página em `src/pages/`
3. **Banco**: Atualizar `prisma/schema.prisma` e fazer `db:push`
4. **Tipos**: Adicionar em `src/types/`
5. **Documentar**: Atualizar README.md e este arquivo

### Ao Corrigir Bugs

1. **Identificar** a causa raiz
2. **Testar** localmente
3. **Commitar** com mensagem clara: `fix: descrição do bug`
4. **Verificar** se não quebrou outras funcionalidades

### Versionamento Semântico

- **MAJOR** (3.0.0): Mudanças incompatíveis
- **MINOR** (2.2.0): Novas funcionalidades compatíveis
- **PATCH** (2.1.1): Correções de bugs

**Incrementar versionCode** sempre (+1 a cada versão)

---

## 👨‍💻 CONTATO DO DESENVOLVEDOR

**Vinícius Ribeiro Ramos**
- Email: viniciusribramos@gmail.com
- WhatsApp: (42) 99106-6464
- GitHub: @LuckyEasyGold
- Projeto: https://github.com/LuckyEasyGold/tarifaZero
- Deploy: https://tarifazero.vercel.app

---

## 💛 APOIADORES ATUAIS

1. **Marcos Dieison** - [@marcdieison](https://www.instagram.com/marcdieison)
2. **Din0** - sem link
3. **Leticia** - [@leti_bzt](https://www.instagram.com/leti_bzt)
4. **Claudio** - [@claudiomarturra](https://www.instagram.com/claudiomarturra)

**Chave Pix**: 46991966464 (Vinícius Ribeiro Ramos)

---

**Última Atualização**: 30/03/2026  
**Versão do Documento**: 2.1.0
