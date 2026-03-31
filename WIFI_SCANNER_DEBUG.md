# WiFi Scanner - Debug Guide

## O que foi feito (Versão 2.3.0)

### Problema Original
- Plugin `WifiScanner` retornava erro: "plugin is not implemented on Android"
- Plugin estava como módulo Gradle separado (`capacitor-wifi-scanner/`)
- Não estava sendo carregado corretamente pelo Capacitor

### Solução Implementada (Opção 2 + Opção 5)

#### 1. Plugin movido para dentro do app
- `WifiScannerPlugin.java` agora está em: `android/app/src/main/java/com/newsdrop/tarifazero/`
- Mesmo package do `MainActivity.java`: `com.newsdrop.tarifazero`
- Plugin compila junto com o app (não como módulo separado)

#### 2. Logs detalhados adicionados
- Logs em TODOS os métodos do plugin
- Logs mostram:
  - Quando o plugin é carregado (`load()`)
  - Quando `scan()` é chamado
  - Estado das permissões
  - Resultado do scan
  - Qualquer erro que ocorrer

#### 3. Arquivos modificados
- ✅ `android/settings.gradle` - Removido include do módulo
- ✅ `android/app/build.gradle` - Removida dependência do módulo + versão 2.3.0
- ✅ `MainActivity.java` - Import corrigido (sem subpackage)
- ✅ `WifiScannerPlugin.java` - Logs detalhados adicionados
- ✅ Diretório `android/capacitor-wifi-scanner/` - REMOVIDO
- ✅ `package.json` - Versão 2.3.0
- ✅ `UpdateNotification.tsx` - CURRENT_VERSION_CODE = 4
- ✅ `api/index.js` - versionCode 4
- ✅ `public/version.json` - versionCode 4

---

## Como testar

### 1. Build do APK
```powershell
# Limpar build anterior
Remove-Item -Recurse -Force android/app/build

# Gerar novo APK
.\build-apk.ps1
```

### 2. Instalar no celular
```powershell
# Via USB
adb install -r android/app/build/outputs/apk/debug/TarifaZero.apk

# Ou copiar para public/ e baixar pelo app
Copy-Item android/app/build/outputs/apk/debug/TarifaZero.apk public/TarifaZero.apk
```

### 3. Monitorar logs em tempo real
```powershell
# Filtrar apenas logs do WifiScanner
adb logcat | Select-String "WifiScanner"

# Ou ver todos os logs do app
adb logcat | Select-String "tarifazero"
```

### 4. O que procurar nos logs

#### ✅ Plugin carregado com sucesso:
```
D/WifiScanner: === PLUGIN LOADED SUCCESSFULLY ===
D/MainActivity: WifiScannerPlugin registrado com sucesso!
```

#### ✅ Scan iniciado:
```
D/WifiScanner: === SCAN METHOD CALLED ===
D/WifiScanner: Android Version: 33
D/WifiScanner: WiFi Enabled: true
D/WifiScanner: startScan() iniciado com SUCESSO
```

#### ✅ Redes encontradas:
```
D/WifiScanner: === BROADCAST RECEIVER TRIGGERED ===
D/WifiScanner: Scan SUCESSO! 5 redes encontradas
D/WifiScanner: Rede #1: MinhaRede (aa:bb:cc:dd:ee:ff) - -45 dBm @ 2437 MHz
D/WifiScanner: === RETORNANDO 5 REDES PARA JAVASCRIPT ===
```

#### ❌ Erro de permissão:
```
D/WifiScanner: Permissão NEARBY_WIFI_DEVICES não concedida, solicitando...
```

#### ❌ WiFi desligado:
```
W/WifiScanner: WiFi está DESABILITADO, tentando usar cache...
```

#### ❌ Plugin não carregou:
```
E/WifiScanner: === PLUGIN LOAD FAILED ===
E/MainActivity: ERRO ao registrar WifiScannerPlugin
```

---

## Diferenças entre APKs

### APK GitHub (28.8 MB)
- Build feito no GitHub Actions (Linux)
- Pode incluir símbolos de debug extras
- Usa configuração padrão do Gradle

### APK Local (19.4 MB)
- Build feito no Windows
- Usa `gradle.properties.local` (configuração otimizada)
- Pode ter compressão diferente

**Ambos devem funcionar igualmente!** A diferença de tamanho não afeta funcionalidade.

---

## Próximos passos

1. **Testar no celular real** com logs ativos
2. **Verificar se o plugin carrega** (logs de `MainActivity`)
3. **Testar detecção de WiFi** na tela de Rastreamento
4. **Analisar logs** para identificar onde exatamente falha (se falhar)
5. **Reportar resultado** com os logs relevantes

---

## Comandos úteis

```powershell
# Ver dispositivos conectados
adb devices

# Limpar logs antigos
adb logcat -c

# Salvar logs em arquivo
adb logcat > logs.txt

# Ver apenas erros
adb logcat *:E

# Desinstalar app antigo
adb uninstall com.newsdrop.tarifazero
```
