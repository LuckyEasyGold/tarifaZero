#!/bin/bash
# Setup do ambiente Linux para build do TarifaZero
# Uso: ./setup-linux.sh

set -e

echo "================================================"
echo "  Setup do ambiente - TarifaZero (Linux)"
echo "================================================"
echo ""

# ── 1. Node.js via nvm ──────────────────────────────
echo "📦 [1/5] Instalando Node.js 20 via nvm..."
if [ -d "$HOME/.nvm" ]; then
  echo "   nvm já instalado, carregando..."
else
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20

# Garantir que node/npm ficam no PATH permanentemente
if ! grep -q 'NVM_DIR' ~/.bashrc; then
  cat >> ~/.bashrc << 'EOF'

# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
fi

echo "   ✅ Node $(node -v) / npm $(npm -v)"
echo ""

# ── 2. Java 17 ──────────────────────────────────────
echo "☕ [2/5] Instalando Java 17..."
sudo apt-get update -qq
sudo apt-get install -y openjdk-17-jdk

export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
echo "   ✅ Java: $(java -version 2>&1 | head -1)"
echo "   JAVA_HOME: $JAVA_HOME"

# Persistir JAVA_HOME
if ! grep -q 'JAVA_HOME' ~/.bashrc; then
  echo "export JAVA_HOME=$JAVA_HOME" >> ~/.bashrc
fi
echo ""

# ── 3. Android SDK (command line tools) ─────────────
echo "🤖 [3/5] Instalando Android SDK..."
ANDROID_HOME="$HOME/Android/Sdk"
mkdir -p "$ANDROID_HOME/cmdline-tools"

if [ ! -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "   Baixando command line tools..."
  wget -q --show-progress \
    "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" \
    -O /tmp/cmdline-tools.zip
  unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools-extract
  mv /tmp/cmdline-tools-extract/cmdline-tools "$ANDROID_HOME/cmdline-tools/latest"
  rm -f /tmp/cmdline-tools.zip
  echo "   ✅ Command line tools instalados"
else
  echo "   ✅ Command line tools já instalados"
fi

# Variáveis de ambiente do Android SDK
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

if ! grep -q 'ANDROID_HOME' ~/.bashrc; then
  cat >> ~/.bashrc << EOF

# Android SDK
export ANDROID_HOME=\$HOME/Android/Sdk
export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/build-tools/34.0.0
EOF
fi

# Aceitar licenças e instalar plataformas
echo "   Aceitando licenças e instalando plataformas..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
echo "   ✅ Android SDK configurado (API 34, build-tools 34.0.0)"
echo ""

# ── 4. Dependências do projeto ───────────────────────
echo "📦 [4/5] Instalando dependências do projeto..."
npm install --legacy-peer-deps
echo "   ✅ node_modules instalado"
echo ""

# ── 5. Permissão do gradlew ──────────────────────────
echo "🔧 [5/5] Ajustando permissões..."
chmod +x android/gradlew
echo "   ✅ android/gradlew executável"
echo ""

# ── Resumo ───────────────────────────────────────────
echo "================================================"
echo "  ✅ Setup concluído!"
echo "================================================"
echo ""
echo "  Node:        $(node -v)"
echo "  npm:         $(npm -v)"
echo "  Java:        $(java -version 2>&1 | awk -F '"' '/version/ {print $2}')"
echo "  Android SDK: $ANDROID_HOME"
echo ""
echo "⚠️  Execute o comando abaixo para recarregar o PATH:"
echo "   source ~/.bashrc"
echo ""
echo "Depois é só usar:"
echo "   ./release.sh \"mensagem do commit\""
echo ""
