# Arquivos Envolvidos no WiFi Scanner

## 1. PLUGIN JAVA (Android Nativo)

### `android/app/src/main/java/com/newsdrop/tarifazero/WifiScannerPlugin.java`
- **O QUE FAZ**: Plugin Capacitor que acessa WiFi do Android
- **RESPONSÁVEL POR**: Escanear redes WiFi, pedir permissões, retornar lista de redes
- **ESTADO ATUAL**: Simplificado, usa `getScanResults()` (cache do sistema)

### `android/app/src/main/java/com/newsdrop/tarifazero/MainActivity.java`
- **O QUE FAZ**: Activity principal do app Android
- **RESPONSÁVEL POR**: Registrar o WifiScannerPlugin no Capacitor
- **LINHA CRÍTICA**: `registerPlugin(WifiScannerPlugin.class);`

---

## 2. PERMISSÕES (Android)

### `android/app/src/main/AndroidManifest.xml`
- **O QUE FAZ**: Declara permissões necessárias
- **PERMISSÕES NECESSÁRIAS**:
  - `ACCESS_WIFI_STATE` - Ver estado do WiFi
  - `CHANGE_WIFI_STATE` - Mudar estado do WiFi
  - `ACCESS_FINE_LOCATION` - Localização (Android < 13)
  - `NEARBY_WIFI_DEVICES` - Dispositivos próximos (Android 13+)

---

## 3. HOOK JAVASCRIPT (Frontend)

### `src/hooks/useWifiScanner.ts`
- **O QUE FAZ**: Hook React que chama o plugin nativo
- **RESPONSÁVEL POR**: 
  - Registrar plugin Capacitor
  - Chamar `WifiScanner.scan()`
  - Gerenciar estado (loading, erro, redes)
  - Mostrar alerts de debug

---

## 4. PÁGINAS QUE USAM O SCANNER

### `src/pages/Contribuir.tsx`
- **O QUE FAZ**: Página onde usuário inicia rastreamento
- **USA**: `useWifiScanner()` hook
- **MOSTRA**: Card com lista de redes WiFi detectadas

---

## 5. CONFIGURAÇÃO CAPACITOR

### `capacitor.config.ts`
- **O QUE FAZ**: Configuração do Capacitor
- **IMPORTANTE**: Define package name, appId, etc

---

## 6. BUILD (Gradle)

### `android/app/build.gradle`
- **O QUE FAZ**: Configuração de build do Android
- **IMPORTANTE**: 
  - `versionCode` e `versionName`
  - Dependências do projeto

### `android/settings.gradle`
- **O QUE FAZ**: Define módulos do projeto
- **ESTADO ATUAL**: Módulo `capacitor-wifi-scanner` REMOVIDO (plugin agora está dentro do app)

---

## FLUXO COMPLETO

```
1. App abre
   ↓
2. MainActivity.onCreate() registra WifiScannerPlugin
   ↓
3. WifiScannerPlugin.load() é chamado
   ↓ (deve mostrar toast "✅ WiFi Scanner carregado!")
   
4. Usuário vai em Contribuir
   ↓
5. useWifiScanner() hook é montado
   ↓
6. Hook chama WifiScanner.scan()
   ↓ (deve mostrar alert "🔍 JS: Chamando...")
   
7. Capacitor roteia para WifiScannerPlugin.scan()
   ↓ (deve mostrar toast "🔍 Iniciando scan...")
   
8. Plugin verifica permissões
   ↓
9. Plugin chama wifiManager.getScanResults()
   ↓
10. Plugin retorna lista de redes
    ↓ (deve mostrar toast "✅ X redes encontradas!")
    
11. JavaScript recebe resultado
    ↓ (deve mostrar alert "✅ JS: Scan retornou...")
    
12. Hook atualiza estado
    ↓
13. UI mostra lista de redes
```

---

## ONDE PODE ESTAR FALHANDO?

### Se NENHUM toast/alert aparece:
- **Problema**: App não está sendo executado ou crashou
- **Verificar**: Logcat do Android

### Se só toast "✅ WiFi Scanner carregado!" aparece:
- **Problema**: JavaScript não está chamando o plugin
- **Verificar**: `useWifiScanner.ts` e `Contribuir.tsx`

### Se alert "🔍 JS: Chamando..." aparece mas nenhum toast Java:
- **Problema**: Capacitor não está roteando para o plugin
- **Verificar**: Nome do plugin, registro no MainActivity

### Se toasts Java aparecem mas alert de erro:
- **Problema**: Plugin está retornando erro
- **Verificar**: Mensagem de erro específica

---

## ARQUIVOS QUE VOCÊ PODE MODIFICAR

Para testar diferentes abordagens, você pode modificar:

1. **`WifiScannerPlugin.java`** - Lógica do scan
2. **`AndroidManifest.xml`** - Adicionar/remover permissões
3. **`useWifiScanner.ts`** - Lógica JavaScript
4. **`Contribuir.tsx`** - UI e quando chamar o scan

---

## PRÓXIMO PASSO

**TESTE O APK** (`public/TarifaZero.apk` - 66.74 MB) e me diga:
- Quais toasts aparecem?
- Quais alerts aparecem?
- Qual é a mensagem de erro (se houver)?

Com essa informação, vou saber EXATAMENTE onde está falhando.
