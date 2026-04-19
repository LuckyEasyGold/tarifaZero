# Instruções para Agente MCP - Configuração Final do Sistema de Colaboração de Rotas

## Contexto
O sistema de colaboração de rotas de ônibus foi implementado com as seguintes funcionalidades:
- Gravação de trajetos em tempo real
- Validação por consenso (≥3 usuários com 90% de similaridade)
- Criação de paradas durante gravação
- Comparação automática horária para definir rotas oficiais

## O Que Já Está Implementado
✅ Schema do Prisma com tabelas `UserTrajectory` e `UserStop`
✅ APIs backend para start/stop/point/stop-mark
✅ Endpoint `/api/admin/validate-routes` para validação automática
✅ Frontend da página Contribuir com fluxo simplificado
✅ Integração na Home.tsx com coleta GPS em tempo real
✅ Modal de aviso sobre validação colaborativa

## Tarefas Pendentes para o Agente MCP

### 1. Configurar Background Geolocation no Capacitor
**Arquivo:** `capacitor.config.ts`

Adicionar configuração para permitir coleta de GPS em segundo plano:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seuapp.onibus',
  appName: 'Seu App',
  webDir: 'out',
  plugins: {
    BackgroundGeolocation: {
      enabled: true,
      foregroundTitle: 'Gravando Rota',
      foregroundText: 'O app está coletando seu trajeto',
      foregroundIcon: 'drawable/ic_notification',
      locationPriority: 'high_accuracy',
      interval: 5000, // 5 segundos
      fastestInterval: 3000,
      activitiesInterval: 10000,
      stopOnTerminate: false,
      startOnBoot: true,
      startForeground: true,
      showNotification: true,
      debug: true
    }
  }
};

export default config;
```

**Ação:** Instalar plugin se necessário:
```bash
npm install @capacitor-community/background-geolocation
npx cap sync
```

### 2. Ajustar Componente BusMap.tsx
**Arquivo:** `src/components/BusMap.tsx`

Adicionar props para renderizar duas rotas simultaneamente:

```typescript
interface BusMapProps {
  routeData?: RouteData;
  userLocation?: { latitude: number; longitude: number };
  recordingPath?: Coordinate[]; // Nova prop
  recordingLineColor?: string;   // Nova prop (vermelho)
  officialLineColor?: string;    // Nova prop (azul)
}
```

**Implementação:**
- Se `recordingPath` existir, desenhar polyline em vermelho (#FF0000)
- Manter rota oficial em azul (#0000FF) ou cor padrão
- Garantir que ambas as rotas sejam visíveis simultaneamente

### 3. Estilizar Botão "Criar Parada"
**Arquivo:** `src/pages/Home.tsx` ou onde o botão estiver localizado

Quando em modo gravação (`isRecording === true`):
- Botão deve ocupar 100% da largura da tela
- Posicionado na parte inferior fixa
- Texto: "📍 Criar Parada"
- Ao clicar: abrir modal com input e placeholder "Ex: Praça Central, Mercadinho do Seu Zé"

**Exemplo de estilo:**
```tsx
{isRecording && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000
  }}>
    <IonButton expand="block" onClick={handleCreateStop}>
      📍 Criar Parada
    </IonButton>
  </div>
)}
```

### 4. Configurar Cron Job para Validação Horária
**Opção A:** Usar Vercel Cron (se deploy na Vercel)
- Criar `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/admin/validate-routes",
    "schedule": "0 * * * *"
  }]
}
```

**Opção B:** Usar node-cron (se servidor Node tradicional)
- Criar arquivo `src/cron/routeValidation.ts`:
```typescript
import cron from 'node-cron';
import { validateRoutes } from '../lib/validation';

cron.schedule('0 * * * *', async () => {
  console.log('Iniciando validação horária de rotas...');
  await validateRoutes();
});
```

### 5. Testar Fluxo Completo
**Checklist de testes:**
1. [ ] Usuário seleciona linha e clica em "Gravar Rota"
2. [ ] Modal de aviso aparece corretamente
3. [ ] Redireciona para mapa com rota oficial em azul
4. [ ] Trajeto sendo gravado aparece em vermelho em tempo real
5. [ ] Botão "Criar Parada" visível apenas em modo gravação
6. [ ] Modal de nomear parada abre com placeholder correto
7. [ ] GPS continua coletando com app em segundo plano
8. [ ] Ao finalizar, dados são salvos em `UserTrajectory`
9. [ ] Executar `/api/admin/validate-routes` manualmente para testar validação
10. [ ] Verificar se ≥3 rotas similares viram oficiais

## Comandos Úteis

```bash
# Sync alterações do Capacitor
npx cap sync

# Rodar em dispositivo móvel (testar background)
npx cap run android
npx cap run ios

# Testar endpoint de validação
curl http://localhost:3000/api/admin/validate-routes

# Ver logs do Prisma
npx prisma studio
```

## Estrutura de Dados Esperada

### UserTrajectory
```prisma
model UserTrajectory {
  id        String   @id @default(cuid())
  userId    String
  lineId    String
  status    String   @default("pending") // pending, verified, official
  points    Json     // Array de {lat, lng, timestamp, speed}
  createdAt DateTime @default(now())
  similarityScore Float? // Para comparação
}
```

### UserStop
```prisma
model UserStop {
  id            String   @id @default(cuid())
  trajectoryId  String
  userId        String
  lineId        String
  latitude      Float
  longitude     Float
  name          String?  // Nome sugerido pelo usuário
  status        String   @default("pending")
  voteCount     Int      @default(1)
  createdAt     DateTime @default(now())
}
```

## Critérios de Aceite

- ✅ Rota oficial e rota gravada visíveis simultaneamente no mapa
- ✅ Coleta GPS funciona em segundo plano
- ✅ Botão "Criar Parada" só aparece em modo gravação
- ✅ Validação automática roda a cada hora
- ✅ ≥3 rotas 90% similares → nova rota oficial
- ✅ Paradas também validadas por consenso
- ✅ Velocidade média por segmento mantida

## Dúvidas?
Consulte os arquivos já implementados:
- `prisma/schema.prisma`
- `src/pages/Contribuir.tsx`
- `src/pages/Home.tsx`
- `src/app/api/trajectories/`
- `src/app/api/admin/validate-routes.ts`
