# 🔧 Passos no Android Studio para Corrigir WifiScanner

**IMPORTANTE**: Siga EXATAMENTE esta ordem!

---

## 📋 Pré-requisitos

Antes de abrir o Android Studio, execute:

```bash
# 1. Limpar build
rm -rf android/app/build

# 2. Build frontend
npm run build

# 3. Sincronizar Capacitor
npx cap sync android
```

---

## 🚀 Passos no Android Studio

### 1. Abrir Projeto
```bash
npx cap open android
```

Aguarde o Android Studio abrir completamente.

---

### 2. Invalidar Cache (CRÍTICO!)

Esta é a etapa mais importante:

1. No menu: `File > Invalidate Caches...`
2. Marcar TODAS as opções:
   - ✅ Clear file system cache and Local History
   - ✅ Clear VCS Log caches and indexes
   - ✅ Clear downloaded shared indexes
   - ✅ Clear workspace indexes
3. Clicar em `Invalidate and Restart`
4. Aguardar o Android Studio reiniciar (pode demorar 2-3 minutos)

**Por quê?** O Android Studio mantém cache do código Java. Se o WifiScannerPlugin foi adicionado/modificado, o cache antigo pode estar impedindo o registro.

---

### 3. Sync Project with Gradle Files

Após o Android Studio reiniciar:

1. No menu: `File > Sync Project with Gradle Files`
2. Aguardar a sincronização (barra de progresso no canto inferior direito)
3. Verificar se não há erros na aba `Build` (parte inferior)

**Erros comuns**:
- ❌ "Cannot resolve symbol WifiScannerPlugin"
  - Solução: Verificar se o arquivo `WifiScannerPlugin.java` existe em `android/app/src/main/java/com/newsdrop/tarifazero/`

---

### 4. Clean Project

1. No menu: `Build > Clean Project`
2. Aguardar conclusão (pode demorar 1-2 minutos)

---

### 5. Rebuild Project

1. No menu: `Build > Rebuild Project`
2. Aguardar conclusão (pode demorar 3-5 minutos)
3. Verificar se não há erros na aba `Build`

**Se houver erros**:
- Copie o erro completo
- Verifique se é relacionado ao WifiScannerPlugin
- Verifique se todos os imports estão corretos

---

### 6. Verificar Estrutura do Projeto

Na aba `Project` (lado esquerdo), verifique se existe:

```
app/
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── newsdrop/
│                   └── tarifazero/
│                       ├── MainActivity.java ✅
│                       └── WifiScannerPlugin.java ✅
```

Se `WifiScannerPlugin.java` não aparecer:
1. Clique com botão direito em `tarifazero`
2. `New > Java Class`
3. Nome: `WifiScannerPlugin`
4. Copie o conteúdo do arquivo original

---

### 7. Desinstalar App Antigo

**Opção A - Via Celular/Emulador**:
1. Abrir "Configurações"
2. "Apps" ou "Aplicativos"
3. Procurar "Tarifa Zero"
4. Clicar em "Desinstalar"

**Opção B - Via ADB** (mais rápido):
```bash
adb uninstall com.newsdrop.tarifazero
```

**Por quê?** O Android não substitui plugins nativos em atualizações. É necessário desinstalar completamente.

---

### 8. Instalar Nova Versão

1. Conectar celular via USB (ou iniciar emulador)
2. Verificar se o dispositivo aparece no topo (ao lado do botão ▶️)
3. Clicar no botão verde ▶️ `Run 'app'`
4. Aguardar instalação (1-2 minutos)

---

### 9. Verificar Logcat (CRÍTICO!)

Assim que o app abrir no celular:

1. No Android Studio, abrir aba `Logcat` (parte inferior)
2. No campo de filtro, digitar: `MainActivity`
3. Procurar por:

**✅ SUCESSO - Deve aparecer**:
```
MainActivity: MainActivity onCreate - Registrando WifiScannerPlugin
MainActivity: WifiScannerPlugin registrado com sucesso!
WifiScanner: Plugin carregado
```

**❌ ERRO - Se aparecer**:
```
MainActivity: ERRO ao registrar WifiScannerPlugin: ...
```

4. Depois, filtrar por: `WifiScanner`
5. Procurar por:

**✅ SUCESSO**:
```
WifiScanner: Plugin carregado
WifiScanner: scan() chamado
WifiScanner: Android 13+ detectado (API 33)
```

**❌ ERRO - Nada aparece**:
- Plugin não foi registrado
- Voltar ao passo 2 (Invalidar Cache)

---

### 10. Testar no App

1. Abrir o app no celular
2. Ir em "Contribuir"
3. Selecionar uma linha
4. Observar se:
   - ✅ Aparece "Escaneando redes Wi-Fi..."
   - ✅ Aparece card com redes detectadas
   - ❌ Aparece erro "plugin is not implemented"

---

## 🐛 Troubleshooting

### Erro: "Cannot resolve symbol WifiScannerPlugin"

**Causa**: Android Studio não encontra a classe

**Solução**:
1. Verificar se arquivo existe: `android/app/src/main/java/com/newsdrop/tarifazero/WifiScannerPlugin.java`
2. Verificar package no topo do arquivo: `package com.newsdrop.tarifazero;`
3. Invalidar cache novamente (passo 2)

---

### Erro: "Plugin is not implemented"

**Causa**: Plugin não foi registrado na bridge do Capacitor

**Solução**:
1. Verificar Logcat - procurar por "MainActivity"
2. Se não aparecer "WifiScannerPlugin registrado com sucesso!", o registro falhou
3. Verificar se `MainActivity.java` tem o código correto
4. Rebuild Project (passo 5)
5. Desinstalar e reinstalar app (passos 7-8)

---

### Erro: "Permissão negada"

**Causa**: App não tem permissão de localização

**Solução**:
1. No celular: Configurações > Apps > Tarifa Zero > Permissões
2. Localização: Selecionar "Permitir sempre" ou "Permitir somente durante o uso"
3. Reiniciar app

---

### Nenhum log aparece no Logcat

**Causa**: Filtro incorreto ou dispositivo não selecionado

**Solução**:
1. No Logcat, verificar se o dispositivo correto está selecionado (dropdown no topo)
2. Limpar filtro (clicar no X)
3. Digitar novamente: `MainActivity` ou `WifiScanner`
4. Verificar se "Show only selected application" está marcado

---

## 📝 Checklist Final

Antes de reportar que não funciona, confirme:

- [ ] Cache invalidado e Android Studio reiniciado
- [ ] Gradle sincronizado sem erros
- [ ] Clean + Rebuild executados
- [ ] App antigo desinstalado completamente
- [ ] Nova versão instalada
- [ ] Logcat aberto e filtrando por "MainActivity"
- [ ] Log "WifiScannerPlugin registrado com sucesso!" aparece
- [ ] Logcat filtrando por "WifiScanner"
- [ ] Log "Plugin carregado" aparece
- [ ] WiFi ligado no celular
- [ ] Permissão de localização concedida

---

## 🎯 Logs Esperados (Completo)

Quando tudo estiver funcionando, você verá esta sequência no Logcat:

```
[MainActivity] MainActivity onCreate - Registrando WifiScannerPlugin
[MainActivity] WifiScannerPlugin registrado com sucesso!
[WifiScanner] Plugin carregado
[WiFi Scanner] App nativo detectado, iniciando scan automático
[WiFi Scanner] Executando scan...
[WifiScanner] scan() chamado
[WifiScanner] Android 13+ detectado (API 33)
[WifiScanner] Permissão NEARBY_WIFI_DEVICES não concedida, solicitando...
[WifiScanner] permissionsCallback() chamado
[WifiScanner] Permissão NEARBY_WIFI_DEVICES concedida
[WifiScanner] performScan() iniciado
[WifiScanner] WiFi está habilitado
[WifiScanner] BroadcastReceiver registrado
[WifiScanner] wifiManager.startScan() retornou: true
[WifiScanner] BroadcastReceiver.onReceive() chamado
[WifiScanner] BroadcastReceiver desregistrado
[WifiScanner] Scan completado. Redes encontradas: 5
[WifiScanner] Rede: MinhaRede (AA:BB:CC:DD:EE:FF) - -45 dBm @ 2437 MHz
[WifiScanner] Retornando 5 redes para o JavaScript
[WiFi Scanner] Resultado: {networks: Array(5)}
[WiFi Scanner] Redes encontradas: 5
```

---

**Última Atualização**: 31/03/2026  
**Versão**: 2.1.0
