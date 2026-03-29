# 📱 Guia de Build Android - Tarifa Zero

## Pré-requisitos

1. **Android Studio** instalado
2. **Java JDK 17** ou superior
3. **Node.js** e **npm** instalados

---

## 🚀 Gerar APK

### Opção 1: Linha de Comando (Rápido)

```bash
# 1. Build e sincronizar
npm run android:sync

# 2. Abrir no Android Studio
npm run android:open

# 3. No Android Studio:
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Opção 2: Gradle (Direto)

```bash
# Build APK de debug
npm run android:build

# APK gerado em:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Instalar no Celular

### Via USB:

```bash
# Habilitar "Depuração USB" no celular
# Conectar via USB

# Instalar APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Via Arquivo:

1. Copiar `app-debug.apk` para o celular
2. Abrir o arquivo no celular
3. Permitir instalação de fontes desconhecidas
4. Instalar

---

## 🔧 Desenvolvimento

### Executar em modo desenvolvimento:

```bash
# Terminal 1: Servidor de desenvolvimento
npm run dev

# Terminal 2: Sincronizar e abrir Android Studio
npm run android:sync
npm run android:open

# No Android Studio: Run > Run 'app'
```

### Live Reload:

O app vai conectar no servidor local (`http://localhost:5173`) automaticamente.

---

## 🎯 Funcionalidades Nativas

### Wi-Fi Scanner
- Detecta redes Wi-Fi próximas
- Identifica automaticamente o ônibus
- Funciona apenas no app nativo (não na web)

### GPS Nativo
- Maior precisão que GPS web
- Tracking em background
- Menor consumo de bateria

### Permissões Necessárias:
- ✅ Localização (GPS)
- ✅ Wi-Fi State (ler redes)
- ✅ Internet

---

## 📝 Notas

- **APK Debug**: Para testes (não publicar na Play Store)
- **APK Release**: Precisa assinar com keystore
- **Tamanho**: ~15-20 MB
- **Android mínimo**: 5.0 (API 21)

---

## 🐛 Troubleshooting

### Erro: "SDK not found"
```bash
# Definir ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Erro: "Gradle build failed"
```bash
# Limpar cache
cd android
./gradlew clean
cd ..
npm run android:sync
```

### Erro: "Plugin not found"
```bash
# Reinstalar dependências
npm install
npx cap sync android
```

---

## 🎉 Pronto!

Agora você tem um APK funcional com:
- ✅ Splash screen com vídeo
- ✅ Scanner de Wi-Fi nativo
- ✅ GPS de alta precisão
- ✅ Todas as funcionalidades web

**APK gerado em:** `android/app/build/outputs/apk/debug/app-debug.apk`
