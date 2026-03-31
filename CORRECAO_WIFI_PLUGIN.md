# 🔧 Correção do Erro "WifiScanner plugin is not implemented on Android"

**Data**: 31/03/2026  
**Problema**: Plugin WifiScanner não está sendo reconhecido no Android

---

## ✅ Correções Aplicadas

### 1. AndroidManifest.xml
**Problema**: Flag `neverForLocation` impedia detecção de WiFi para identificar localização  
**Solução**: Removida a flag, mantendo apenas a permissão

```xml
<!-- ANTES -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES"
    android:usesPermissionFlags="neverForLocation" />

<!-- DEPOIS -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
```

### 2. ProGuard Rules
**Problema**: ProGuard pode remover o plugin durante ofuscação  
**Solução**: Adicionadas regras para manter o WifiScannerPlugin

```proguard
-keep public class com.newsdrop.tarifazero.WifiScannerPlugin { *; }
-keepclassmembers class com.newsdrop.tarifazero.WifiScannerPlugin { *; }
```

### 3. useWifiScanner.ts
**Problema**: Plugin pode não estar carregado quando scan é chamado  
**Solução**: Aumentado timeout de 1s para 2s

```typescript
// ANTES: setTimeout(..., 1000)
// DEPOIS: setTimeout(..., 2000)
```

---

## 🚀 Como Aplicar as Correções

### Opção 1: Script Automático (Recomendado)

Execute o script `fix-wifi-plugin.bat`:

```bash
./fix-wifi-plugin.bat
```

O script fará:
1. Limpar pasta `android/app/build`
2. Gerar Prisma Client
3. Build do frontend
4. Copiar arquivos para Android
5. Sincronizar Capacitor
6. Atualizar dependências Android

### Opção 2: Manual

```bash
# 1. Limpar build
rm -rf android/app/build

# 2. Gerar Prisma Client
npm run db:generate

# 3. Build frontend
npm run build

# 4. Sincronizar Capacitor
npx cap copy android
npx cap sync android
npx cap update android
```

---

## 📱 Testando no Android Studio

### 1. Abrir Projeto
```bash
npx cap open android
```

### 2. Sincronizar Gradle
- No Android Studio: `File > Sync Project with Gradle Files`

### 3. Limpar e Rebuild
- `Build > Clean Project`
- `Build > Rebuild Project`

### 4. Desinstalar App Antigo
- No celular/emulador: Desinstalar "Tarifa Zero"
- Ou via ADB: `adb uninstall com.newsdrop.tarifazero`

### 5. Instalar Nova Versão
- Clicar em `Run 'app'` (▶️) no Android Studio

---

## 🔍 Verificando Logs

### No Android Studio (Logcat)

Filtrar por `WifiScanner` para ver os logs:

```
[WifiScanner] Plugin carregado
[WifiScanner] scan() chamado
[WifiScanner] Android 13+ detectado (API 33)
[WifiScanner] Permissão NEARBY_WIFI_DEVICES OK
[WifiScanner] performScan() iniciado
[WifiScanner] WiFi está habilitado
[WifiScanner] BroadcastReceiver registrado
[WifiScanner] wifiManager.startScan() retornou: true
[WifiScanner] Scan completado. Redes encontradas: 5
```

### Logs Esperados

✅ **Sucesso**:
```
[WifiScanner] Plugin carregado
[WifiScanner] Retornando 5 redes para o JavaScript
```

❌ **Erro - Plugin não registrado**:
```
(Nenhum log aparece)
```

❌ **Erro - Permissão negada**:
```
[WifiScanner] Permissão NEARBY_WIFI_DEVICES negada
```

❌ **Erro - WiFi desligado**:
```
[WifiScanner] WiFi está desabilitado
```

---

## 🐛 Troubleshooting

### Erro persiste após correções

**1. Verificar package do plugin**
```java
// MainActivity.java
package com.newsdrop.tarifazero; // ✅ Deve ser este

// WifiScannerPlugin.java
package com.newsdrop.tarifazero; // ✅ Deve ser o mesmo
```

**2. Verificar nome do plugin**
```java
// WifiScannerPlugin.java
@CapacitorPlugin(name = "WifiScanner", ...) // ✅
```

```typescript
// useWifiScanner.ts
const WifiScanner = registerPlugin<WifiScannerPlugin>('WifiScanner'); // ✅ Mesmo nome
```

**3. Limpar cache do Gradle**
```bash
cd android
./gradlew clean
cd ..
```

**4. Invalidar cache do Android Studio**
- `File > Invalidate Caches / Restart...`
- Selecionar `Invalidate and Restart`

**5. Verificar versão do Android**
- Android 13+ (API 33+): Precisa de `NEARBY_WIFI_DEVICES`
- Android < 13: Precisa de `ACCESS_FINE_LOCATION`

---

## 📋 Checklist de Verificação

Antes de testar, confirme:

- [ ] `android/app/build` foi deletado
- [ ] `npm run build` executado com sucesso
- [ ] `npx cap sync android` executado
- [ ] Android Studio sincronizado com Gradle
- [ ] App antigo desinstalado do dispositivo
- [ ] Nova versão instalada
- [ ] Permissões concedidas no app (Localização)
- [ ] WiFi ligado no dispositivo
- [ ] Logcat aberto e filtrando por "WifiScanner"

---

## 🎯 Arquivos Modificados

1. `android/app/src/main/AndroidManifest.xml` - Removida flag `neverForLocation`
2. `android/app/proguard-rules.pro` - Adicionadas regras para manter plugin
3. `src/hooks/useWifiScanner.ts` - Aumentado timeout para 2s
4. `fix-wifi-plugin.bat` - Script de correção automática (novo)

---

## 📞 Suporte

Se o erro persistir após todas as correções:

1. Capture os logs do Logcat (filtro: WifiScanner)
2. Verifique se a mensagem "Plugin carregado" aparece
3. Teste em outro dispositivo Android (se possível)
4. Verifique a versão do Android (Settings > About Phone > Android Version)

---

**Última Atualização**: 31/03/2026  
**Versão**: 2.1.0
