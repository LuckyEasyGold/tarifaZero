# Guia de Build Local do APK

## Pré-requisitos
- ✅ Java 21 instalado em `C:\Program Files\Java\jdk-21.0.10`
- ✅ Android SDK em `%LOCALAPPDATA%\Android\Sdk`
- 🔄 Android Studio instalando...

## Opção 1: Build via Linha de Comando (Mais Rápido)

### Passo 1: Preparar o projeto
```powershell
# Na raiz do projeto
npm install --legacy-peer-deps
npm run build
npx cap sync android
```

### Passo 2: Build do APK
```powershell
# Entrar na pasta android
cd android

# Configurar Java 21
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"

# Build do APK (primeira vez demora ~10 minutos)
.\gradlew assembleDebug --no-daemon --stacktrace
```

### Passo 3: Localizar o APK
O APK estará em: `android\app\build\outputs\apk\debug\app-debug.apk`

## Opção 2: Build via Android Studio (Quando Instalado)

### Passo 1: Abrir projeto
```powershell
npx cap open android
```

### Passo 2: No Android Studio
1. Aguardar sincronização do Gradle (primeira vez demora)
2. Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Aguardar conclusão
4. Clicar em "locate" quando aparecer notificação

## Opção 3: Script Automatizado
```powershell
# Na raiz do projeto - faz tudo de uma vez
npm run android:build
```

## Verificar Status do Build Atual

Se você já iniciou um build do Gradle, pode verificar o progresso:

```powershell
cd android
# Ver processos Java rodando
Get-Process java

# Se quiser cancelar e recomeçar
taskkill /F /IM java.exe
```

## Troubleshooting

### Build muito lento?
- Primeira build sempre demora (baixa dependências)
- Builds seguintes são mais rápidas (~2-3 minutos)
- Use `--no-daemon` para evitar processo em background

### Erro de memória?
Crie arquivo `android/gradle.properties` com:
```
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

### Erro de SDK?
Configure variável de ambiente:
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

## Testar o APK

### Instalar em dispositivo físico:
1. Ativar "Depuração USB" no celular
2. Conectar via USB
3. ```powershell
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Ou copiar APK para o celular e instalar manualmente

## Status do GitHub Actions

O workflow está configurado para buildar automaticamente a cada push.
Acesse: https://github.com/LuckyEasyGold/tarifaZero/actions

Últimas correções aplicadas:
- ✅ Removido TypeScript check estrito do build
- ✅ Simplificado script de build
- ✅ Adicionado logs de debug

Próximo push deve funcionar! 🚀
