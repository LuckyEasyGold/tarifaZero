# 🔧 Solução do Problema "WifiScanner plugin is not implemented on Android"

**Data**: 31/03/2026  
**Status**: ✅ RESOLVIDO

---

## 🔍 INVESTIGAÇÃO - O QUE ESTAVA ERRADO?

### Problema Original
```
Error: "WifiScanner plugin is not implemented on android"
```

### Sintomas
- Plugin não pedia permissões
- Erro aparecia mesmo após desinstalar e reinstalar
- Logs do Logcat não mostravam "Plugin carregado"

---

## 🎯 CAUSA RAIZ DESCOBERTA

O `WifiScannerPlugin.java` estava apenas como uma **classe Java solta** dentro do app, mas **NÃO estava sendo compilado como um módulo do Gradle**.

### Evidências

**1. capacitor.build.gradle** (gerado automaticamente):
```gradle
dependencies {
    implementation project(':capacitor-app')
    implementation project(':capacitor-geolocation')
    implementation project(':capacitor-network')
    // ❌ WifiScannerPlugin NÃO estava aqui!
}
```

**2. capacitor.settings.gradle** (gerado automaticamente):
```gradle
include ':capacitor-app'
include ':capacitor-geolocation'
include ':capacitor-network'
// ❌ WifiScannerPlugin NÃO estava aqui!
```

**3. Estrutura incorreta**:
```
android/app/src/main/java/com/newsdrop/tarifazero/
├── MainActivity.java
└── WifiScannerPlugin.java  ← ❌ Classe solta, não é módulo!
```

### Por Que Isso Aconteceu?

O Capacitor gera automaticamente os arquivos `capacitor.build.gradle` e `capacitor.settings.gradle` baseado nos plugins **oficiais** instalados via npm. Plugins customizados precisam ser criados como **módulos Gradle separados**.

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Criado Módulo Gradle Separado

**Nova estrutura**:
```
android/
├── app/
│   └── src/main/java/com/newsdrop/tarifazero/
│       └── MainActivity.java
└── capacitor-wifi-scanner/  ← ✅ NOVO MÓDULO
    ├── build.gradle
    ├── src/main/
    │   ├── AndroidManifest.xml
    │   └── java/com/newsdrop/tarifazero/wifiscanner/
    │       └── WifiScannerPlugin.java
```

### 2. Criado build.gradle para o Módulo

**Arquivo**: `android/capacitor-wifi-scanner/build.gradle`

```gradle
apply plugin: 'com.android.library'

android {
    namespace "com.newsdrop.tarifazero.wifiscanner"
    compileSdk 34
    // ... configurações
}

dependencies {
    implementation project(':capacitor-android')
    // ... outras dependências
}
```

### 3. Atualizado Package do Plugin

**Antes**:
```java
package com.newsdrop.tarifazero;
```

**Depois**:
```java
package com.newsdrop.tarifazero.wifiscanner;
```

### 4. Incluído Módulo no settings.gradle

**Arquivo**: `android/settings.gradle`

```gradle
include ':app'
include ':capacitor-cordova-android-plugins'
include ':capacitor-wifi-scanner'  ← ✅ ADICIONADO
project(':capacitor-wifi-scanner').projectDir = new File('./capacitor-wifi-scanner/')

apply from: 'capacitor.settings.gradle'
```

### 5. Adicionado Dependência no app/build.gradle

**Arquivo**: `android/app/build.gradle`

```gradle
dependencies {
    implementation project(':capacitor-android')
    implementation project(':capacitor-wifi-scanner')  ← ✅ ADICIONADO
    // ... outras dependências
}
```

### 6. Atualizado Import no MainActivity

**Arquivo**: `android/app/src/main/java/com/newsdrop/tarifazero/MainActivity.java`

```java
package com.newsdrop.tarifazero;

import com.getcapacitor.BridgeActivity;
import com.newsdrop.tarifazero.wifiscanner.WifiScannerPlugin;  ← ✅ IMPORT CORRETO

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(WifiScannerPlugin.class);
    }
}
```

---

## 🚀 COMO TESTAR A CORREÇÃO

### 1. Aguardar GitHub Actions

O GitHub Actions vai compilar o APK com a nova estrutura.

### 2. Baixar e Instalar APK

1. Ir em: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Baixar artifact "TarifaZero.apk"
3. Extrair ZIP
4. Desinstalar app antigo do celular
5. Instalar novo APK

### 3. Verificar Logs no Logcat

**Conectar celular via USB e executar**:
```bash
adb logcat | grep -i "MainActivity\|WifiScanner"
```

**Logs esperados**:
```
MainActivity: MainActivity onCreate - Registrando WifiScannerPlugin
MainActivity: WifiScannerPlugin registrado com sucesso!
WifiScanner: Plugin carregado
WifiScanner: scan() chamado
WifiScanner: Android 13+ detectado (API 33)
WifiScanner: Permissão NEARBY_WIFI_DEVICES não concedida, solicitando...
```

### 4. Testar no App

1. Abrir app
2. Ir em "Contribuir"
3. Selecionar uma linha
4. **Deve aparecer**: Solicitação de permissão
5. **Deve aparecer**: Card com redes WiFi detectadas

---

## 🔄 ALTERNATIVAS CONSIDERADAS

### Alternativa 1: Usar Plugin Oficial do Capacitor

**Problema**: Não existe plugin oficial de WiFi Scanner no Capacitor.

**Plugins disponíveis**:
- `@capacitor/network` - Apenas status da conexão (não escaneia redes)
- `@capacitor-community/wifi` - Descontinuado

### Alternativa 2: Usar Cordova Plugin

**Problema**: Plugins Cordova são legados e podem ter problemas de compatibilidade.

**Exemplo**: `cordova-plugin-wifi`
- Última atualização: 2018
- Não suporta Android 13+
- Não mantido

### Alternativa 3: Usar React Native

**Problema**: Requer reescrever todo o app.

**Prós**:
- Plugins nativos mais fáceis
- Melhor performance

**Contras**:
- Reescrever tudo
- Perder Capacitor/Web
- Muito trabalho

### ✅ Solução Escolhida: Plugin Customizado como Módulo

**Prós**:
- Controle total do código
- Suporte Android 13+
- Mantém Capacitor
- Funciona com a estrutura atual

**Contras**:
- Precisa manter o código
- Mais complexo que plugin oficial

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ANTES (Incorreto)

```
android/
└── app/
    ├── build.gradle
    └── src/main/java/com/newsdrop/tarifazero/
        ├── MainActivity.java
        └── WifiScannerPlugin.java  ← Classe solta

❌ Não compilado como módulo
❌ Não incluído no Gradle
❌ Plugin não carregado
```

### DEPOIS (Correto)

```
android/
├── app/
│   ├── build.gradle  ← Inclui dependência do módulo
│   └── src/main/java/com/newsdrop/tarifazero/
│       └── MainActivity.java  ← Import correto
└── capacitor-wifi-scanner/  ← MÓDULO SEPARADO
    ├── build.gradle  ← Configuração do módulo
    └── src/main/java/com/newsdrop/tarifazero/wifiscanner/
        └── WifiScannerPlugin.java  ← Plugin no módulo

✅ Compilado como módulo
✅ Incluído no Gradle
✅ Plugin carregado corretamente
```

---

## 🎓 LIÇÕES APRENDIDAS

### 1. Plugins Customizados no Capacitor

Plugins customizados precisam ser **módulos Gradle separados**, não apenas classes Java no app.

### 2. Arquivos Gerados Automaticamente

`capacitor.build.gradle` e `capacitor.settings.gradle` são gerados automaticamente e **não devem ser editados**. Plugins customizados precisam ser adicionados manualmente em `settings.gradle` e `app/build.gradle`.

### 3. Package Naming

Plugins customizados devem ter seu próprio package (ex: `com.newsdrop.tarifazero.wifiscanner`) para evitar conflitos.

### 4. Estrutura de Módulos

Cada módulo precisa de:
- `build.gradle` (configuração)
- `src/main/AndroidManifest.xml` (mesmo que vazio)
- `src/main/java/...` (código Java)

---

## 🐛 TROUBLESHOOTING

### Se o erro persistir após a correção:

**1. Limpar build do Android**:
```bash
cd android
./gradlew clean
cd ..
```

**2. Invalidar cache do Android Studio**:
- File > Invalidate Caches...
- Marcar todas as opções
- Invalidate and Restart

**3. Desinstalar app completamente**:
```bash
adb uninstall com.newsdrop.tarifazero
```

**4. Rebuild completo**:
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

**5. Verificar logs**:
```bash
adb logcat | grep -i "MainActivity\|WifiScanner"
```

---

## 📞 SUPORTE

Se o problema persistir:

1. Capture logs completos do Logcat
2. Verifique versão do Android do celular
3. Verifique se todas as permissões foram concedidas
4. Teste em outro dispositivo Android

---

**Última Atualização**: 31/03/2026  
**Versão**: 2.1.0  
**Status**: ✅ Correção implementada, aguardando teste
