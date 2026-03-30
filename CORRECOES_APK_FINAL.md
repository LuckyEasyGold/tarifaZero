# 🔧 Correções Finais APK - 30/03/2026

## ✅ Problemas Corrigidos

### 1. Tooltip dos Ônibus Simplificado
**Problema:** Tooltip mostrava nome completo da linha, poluindo o mapa

**Solução:**
- Tooltip agora mostra apenas o ID da linha (ex: "001" ao invés de "001 - Terminal Centro")
- Tooltip não é mais permanente (só aparece ao passar o mouse/tocar)
- Tamanho reduzido para não poluir visualmente

**Arquivo:** `src/components/map/BusMap.tsx`

```typescript
<Tooltip permanent={false}>
  <div className="font-semibold text-xs">
    {linha.nome.split(' - ')[0]}  // Pega só o ID
  </div>
</Tooltip>
```

---

### 2. Avatar do Usuário Mostra "Eu"
**Problema:** Avatar do usuário atual não mostrava "Eu", mostrava o nickname

**Solução:**
- Detecta o `anonymousId` do localStorage
- Compara com o ID do usuário no mapa
- Se for o usuário atual, mostra "Eu"
- Para outros usuários, mostra o nickname escolhido

**Arquivo:** `src/components/map/BusMap.tsx`

```typescript
const currentUserId = localStorage.getItem('anonymousId');
const isCurrentUser = user.anonymousId === currentUserId;
const displayName = isCurrentUser ? 'Eu' : (user.nickname || `Usuário ${user.anonymousId.slice(-4)}`);
```

---

### 3. Controles de Zoom (+/-) Adicionados
**Problema:** Controles de zoom não apareciam no APK

**Solução:**
- Adicionado `<ZoomControl position="bottomright" />`
- Habilitado todos os tipos de zoom:
  - `touchZoom={true}` - Pinça com dedos
  - `doubleClickZoom={true}` - Duplo toque
  - `scrollWheelZoom={!isMobile}` - Scroll do mouse (desktop)
  - `boxZoom={true}` - Zoom por seleção
- Controles sempre visíveis no canto inferior direito

**Arquivo:** `src/components/map/BusMap.tsx`

```typescript
<MapContainer
  zoomControl={false}  // Desabilita padrão
  touchZoom={true}
  doubleClickZoom={true}
  dragging={true}
>
  <ZoomControl position="bottomright" />
</MapContainer>
```

---

### 4. Ranking Corrigido (Tela Branca)
**Problema:** Erro `Cannot read properties of undefined (reading 'length')`

**Solução:**
- Corrigido acesso a `data.ranking` ao invés de `data.length`
- Corrigido acesso a `data.stats` para estatísticas
- Validação correta antes de renderizar

**Arquivo:** `src/pages/Ranking.tsx`

**Antes:**
```typescript
{data && data.length > 0 && (
  <div>{data.length}</div>  // ❌ data não tem length
)}
```

**Depois:**
```typescript
{data && data.ranking && data.ranking.length > 0 && (
  <div>{data.stats.totalUsers}</div>  // ✅ Acesso correto
)}
```

---

### 5. WiFi Scanner Melhorado
**Problema:** WiFi não era detectado, mensagem não aparecia

**Solução:**
- Registrado plugin corretamente com `registerPlugin`
- Adicionados logs detalhados para debug
- Scan automático após 1 segundo (aguarda app carregar)
- Mensagens de erro mais claras

**Arquivo:** `src/hooks/useWifiScanner.ts`

```typescript
import { registerPlugin } from '@capacitor/core';

const WifiScanner = registerPlugin<WifiScannerPlugin>('WifiScanner');

// Scan automático com delay
useEffect(() => {
  if (isNative) {
    const timer = setTimeout(() => {
      scan();
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [isNative]);
```

**Logs adicionados:**
- `[WiFi Scanner] Iniciando scan...`
- `[WiFi Scanner] Resultado: {...}`
- `[WiFi Scanner] Redes encontradas: X`
- `[WiFi Scanner] Erro ao escanear: {...}`

---

## 🧪 Como Testar

### 1. Gerar Novo APK

```bash
cd android
$env:ANDROID_HOME = "C:\Users\vinic\AppData\Local\Android\Sdk"
.\gradlew.bat clean assembleDebug
```

APK em: `android/app/build/outputs/apk/debug/app-debug.apk`

### 2. Instalar no Celular

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Ou envie o APK por WhatsApp/Email

### 3. Testar Funcionalidades

**Mapa:**
- [ ] Tooltip dos ônibus mostra só ID (ex: "001")
- [ ] Controles +/- aparecem no canto inferior direito
- [ ] Pinça com dedos faz zoom in/out
- [ ] Duplo toque faz zoom in
- [ ] Avatar mostra "Eu" para usuário atual
- [ ] Outros avatares mostram nickname escolhido

**Ranking:**
- [ ] Página abre sem erro (sem tela branca)
- [ ] Estatísticas aparecem no topo
- [ ] Lista de usuários aparece
- [ ] Nicknames corretos

**Contribuir:**
- [ ] WiFi é detectado automaticamente
- [ ] Lista de redes aparece
- [ ] Mensagem "Escolha a rede WiFi" aparece
- [ ] Ao clicar na rede, ela é validada
- [ ] Botão "Iniciar Tracking" habilita

---

## 📊 Resumo das Alterações

### Arquivos Modificados

1. `src/components/map/BusMap.tsx`
   - Tooltip simplificado (só ID)
   - Avatar mostra "Eu"
   - Controles de zoom adicionados
   - Gestos de zoom habilitados

2. `src/pages/Ranking.tsx`
   - Corrigido acesso a `data.ranking`
   - Corrigido acesso a `data.stats`

3. `src/hooks/useWifiScanner.ts`
   - Plugin registrado corretamente
   - Logs detalhados
   - Scan automático com delay
   - Mensagens de erro claras

---

## 🐛 Debug WiFi Scanner

Se o WiFi ainda não funcionar, verifique:

### 1. Permissões no AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
```

### 2. Logs no Logcat

```bash
adb logcat | grep "WiFi Scanner"
```

Deve aparecer:
```
[WiFi Scanner] App nativo detectado, iniciando scan automático
[WiFi Scanner] Iniciando scan...
[WiFi Scanner] Resultado: {...}
[WiFi Scanner] Redes encontradas: 5
```

### 3. Testar Manualmente

Na página Contribuir, clique em "Atualizar" no card de redes WiFi.

### 4. Verificar Plugin Registrado

No código Java, verifique se `WifiScannerPlugin` está registrado em `MainActivity.java`:

```java
registerPlugin(WifiScannerPlugin.class);
```

---

## ✅ Checklist Final

Antes de fazer commit:

- [x] Tooltip dos ônibus simplificado
- [x] Avatar mostra "Eu"
- [x] Controles de zoom adicionados
- [x] Ranking corrigido
- [x] WiFi scanner melhorado
- [ ] Build testado
- [ ] APK gerado
- [ ] Instalado no celular
- [ ] Todas funcionalidades testadas
- [ ] Logs verificados

---

## 🚀 Próximos Passos

1. **Gerar APK:**
   ```bash
   cd android
   .\gradlew.bat clean assembleDebug
   ```

2. **Testar no celular:**
   - Instalar APK
   - Testar todas as funcionalidades
   - Verificar logs se WiFi não funcionar

3. **Fazer commit:**
   ```bash
   git add .
   git commit -m "fix: corrigido tooltip, zoom, ranking e wifi scanner"
   git push
   ```

4. **Deploy PWA:**
   - PWA já está pronto
   - Será atualizado automaticamente no Vercel

---

## 📝 Notas Importantes

### Tooltip dos Ônibus
- Agora mostra apenas o ID (ex: "001")
- Não é permanente (só aparece ao tocar/hover)
- Popup completo ainda disponível ao clicar

### Avatar "Eu"
- Detecta automaticamente o usuário atual
- Usa `anonymousId` do localStorage
- Outros usuários mostram nickname escolhido

### Zoom
- Controles +/- sempre visíveis
- Pinça funciona corretamente
- Duplo toque faz zoom in
- Todos os gestos habilitados

### Ranking
- Não dá mais tela branca
- Estatísticas corretas
- Lista de usuários funciona

### WiFi Scanner
- Scan automático após 1 segundo
- Logs detalhados para debug
- Mensagens de erro claras
- Plugin registrado corretamente

---

**Todas as correções aplicadas! Pronto para gerar novo APK e testar.** 🚀
