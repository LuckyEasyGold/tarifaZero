#!/bin/bash
# Script de Release Automático - TarifaZero
# Uso: ./release.sh "mensagem do commit"

set -e  # Para na primeira falha

# Carregar nvm para garantir Node correto
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22 2>/dev/null || nvm use default 2>/dev/null || true

# Carregar sdkman para garantir Java correto
export SDKMAN_DIR="$HOME/.sdkman"
[ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ] && \. "$SDKMAN_DIR/bin/sdkman-init.sh"

# Carregar Android SDK
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0"

COMMIT_MESSAGE="$1"

if [ -z "$COMMIT_MESSAGE" ]; then
  echo "❌ Uso: ./release.sh \"mensagem do commit\""
  exit 1
fi

echo "🚀 Iniciando processo de release..."

# 1. Ler versão atual do package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Versão atual: $CURRENT_VERSION"

# 2. Incrementar o último dígito (build number)
IFS='.' read -r -a PARTS <<< "$CURRENT_VERSION"
BUILD_NUMBER=$(( PARTS[3] + 1 ))
NEW_VERSION="${PARTS[0]}.${PARTS[1]}.${PARTS[2]}.${BUILD_NUMBER}"
echo "📦 Nova versão: $NEW_VERSION"

# 3. Remover APKs antigos da raiz
echo "🗑️  Removendo APK antigo..."
for apk in TarifaZero-*.apk; do
  [ -f "$apk" ] && rm -f "$apk" && echo "   Removido: $apk"
done

# 4. Atualizar package.json
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "✅ package.json atualizado"

# 5. Atualizar public/version.json
node -e "
  const fs = require('fs');
  const v = JSON.parse(fs.readFileSync('public/version.json', 'utf8'));
  v.version = '$NEW_VERSION';
  v.versionCode = v.versionCode + 1;
  v.releaseDate = new Date().toISOString().split('T')[0];
  v.downloadUrl = 'https://tarifazero.vercel.app/TarifaZero-$NEW_VERSION.apk';
  fs.writeFileSync('public/version.json', JSON.stringify(v, null, 2) + '\n');
  console.log('versionCode: ' + v.versionCode);
"
NEW_VERSION_CODE=$(node -p "require('./public/version.json').versionCode")
echo "✅ version.json atualizado (versionCode: $NEW_VERSION_CODE)"

# 6. Atualizar android/app/build.gradle
sed -i "s/versionCode [0-9]*/versionCode $NEW_VERSION_CODE/" android/app/build.gradle
sed -i "s/versionName \"[0-9.]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle
echo "✅ build.gradle atualizado"

# 7. Atualizar versão no App.tsx (para limpeza de cache)
sed -i "s/const currentVersion = '[0-9.]*';/const currentVersion = '$NEW_VERSION';/" src/App.tsx
echo "✅ App.tsx atualizado"

# 8. Limpar caches
echo "🧹 Limpando caches..."
rm -rf dist android/app/build android/build

# 9. Build do projeto React
echo "🔨 Compilando projeto React..."
npm run build

# 10. Sync Capacitor
echo "🔄 Sincronizando com Android..."
npx cap sync android

# 11. Build APK Release Assinado
echo "📱 Compilando APK Release Assinado..."

# Detectar Java 17
JAVA_HOME_17=""

# 1. Verificar sdkman (instalado sem sudo)
if [ -d "$HOME/.sdkman/candidates/java/current" ]; then
  JAVA_HOME_17="$HOME/.sdkman/candidates/java/current"
fi

# 2. Buscar versão 17 específica no sdkman
if [ -z "$JAVA_HOME_17" ]; then
  JAVA_HOME_17=$(find "$HOME/.sdkman/candidates/java" -maxdepth 1 -name "17*" -type d 2>/dev/null | head -1)
fi

# 3. Fallback: /usr/lib/jvm
if [ -z "$JAVA_HOME_17" ]; then
  JAVA_HOME_17=$(find /usr/lib/jvm -maxdepth 1 -name "*17*" -type d 2>/dev/null | head -1)
fi

# 4. Fallback: java no PATH
if [ -z "$JAVA_HOME_17" ] && command -v java &>/dev/null; then
  JAVA_HOME_17=$(dirname $(dirname $(readlink -f $(which java))))
fi

if [ -z "$JAVA_HOME_17" ]; then
  echo "❌ Java 17 não encontrado!"
  echo "   Instale via sdkman: sdk install java 17.0.11-tem"
  exit 1
fi

export JAVA_HOME="$JAVA_HOME_17"
echo "   Usando Java: $JAVA_HOME"

# Verificar keystore
if [ ! -f "tarifarzo-release.jks" ]; then
  echo "❌ Keystore não encontrado: tarifarzo-release.jks"
  exit 1
fi

# Ler senhas (sem exibir no terminal)
read -rsp "Digite a senha do keystore: " STORE_PASSWORD
echo ""
read -rsp "Digite a senha da chave (Enter para usar a mesma): " KEY_PASSWORD
echo ""
[ -z "$KEY_PASSWORD" ] && KEY_PASSWORD="$STORE_PASSWORD"

# Copiar keystore para android/app/
cp tarifarzo-release.jks android/app/release-key.jks

# Adicionar propriedades de assinatura ao gradle.properties
cat >> android/gradle.properties << EOF
storeFile=release-key.jks
keyAlias=tarifarzo
storePassword=$STORE_PASSWORD
keyPassword=$KEY_PASSWORD
EOF

# Build
cd android
chmod +x gradlew
./gradlew assembleRelease
BUILD_RESULT=$?
cd ..

# Limpar gradle.properties (remover linhas de assinatura)
grep -v -E "^(storeFile|keyAlias|storePassword|keyPassword)" android/gradle.properties > android/gradle.properties.tmp
mv android/gradle.properties.tmp android/gradle.properties

# Remover keystore temporário
rm -f android/app/release-key.jks

if [ $BUILD_RESULT -ne 0 ]; then
  echo "❌ Erro ao compilar APK"
  exit 1
fi

# 12. Copiar APK para a raiz
APK_SOURCE=$(find android/app/build/outputs/apk/release -name "*.apk" | head -1)
if [ -z "$APK_SOURCE" ]; then
  echo "⚠️  APK não encontrado em android/app/build/outputs/apk/release"
  exit 1
fi

APK_DEST="TarifaZero-${NEW_VERSION}.apk"
cp "$APK_SOURCE" "$APK_DEST"
echo "✅ APK Release assinado copiado para raiz"

# 13. Tamanho do APK
APK_SIZE=$(du -m "$APK_DEST" | cut -f1)
echo "📦 Tamanho do APK: ${APK_SIZE} MB"

# 14. Git commit
echo "📝 Fazendo commit..."
git add -A
git commit -m "v${NEW_VERSION} - ${COMMIT_MESSAGE}"
echo "✅ Commit realizado!"

# 15. Git push
echo "🚀 Enviando para GitHub..."
git push origin main
echo "✅ Push realizado!"

# 16. Resumo
echo ""
echo "✨ Release concluído com sucesso!"
echo "📦 Versão: ${NEW_VERSION} (versionCode: ${NEW_VERSION_CODE})"
echo "📱 APK: ${APK_DEST} (${APK_SIZE} MB)"
echo "🗑️  APK antigo removido automaticamente"
echo ""
echo "💡 O Vercel vai publicar automaticamente em:"
echo "   https://tarifazero.vercel.app/TarifaZero-${NEW_VERSION}.apk"
