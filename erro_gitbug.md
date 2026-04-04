# 🤖 MCP Task: Corrigir Erro de Java Home no GitHub Actions (Gradle + Capacitor Android)

## 📋 Resumo Executivo
Projeto: TarifaZero (Capacitor + Android)
Problema: O workflow do GitHub Actions falha ao construir o APK com o erro:
"Value 'C:/Program Files/Eclipse Adoptium/jdk-17.0.18.8-hotspot' given for org.gradle.java.home Gradle property is invalid"
Causa: O arquivo gradle.properties contém um caminho de Java hardcoded para Windows, mas o runner do GitHub Actions é Linux.
Objetivo: Remover configurações de ambiente local do gradle.properties e configurar o workflow para usar o Java correto do runner.

## 🗂️ Diagnóstico Técnico
| Sintoma | Causa Raiz | Solução |
|---------|-----------|---------|
| Gradle falha no GitHub Actions | gradle.properties tem org.gradle.java.home=C:/Program Files/... (caminho Windows) | Remover ou condicionar essa propriedade |
| Runner é Linux mas path é Windows | Workflow não define JAVA_HOME, então Gradle usa o valor inválido do properties | Usar actions/setup-java no workflow |
| Build funciona localmente mas falha no CI | Desenvolvedor tem JDK instalado em C:/, runner não | Usar variáveis de ambiente ou conditional properties |

## 🎯 TAREFAS EM ORDEM DE EXECUÇÃO

### 🔴 TAREFA 1: Corrigir gradle.properties (Remover Hardcoding)
Arquivo: android/app/gradle.properties OU android/gradle.properties
Objetivo: Remover a propriedade org.gradle.java.home que aponta para caminho local do desenvolvedor.

Passo 1.1: Localizar e remover/comentar a linha problemática
# ❌ REMOVER ou COMENTAR esta linha (caminho Windows hardcoded):
# org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-17.0.18.8-hotspot

# ✅ Se precisar definir Java home, use variável de ambiente (funciona em qualquer OS):
# org.gradle.java.home=${env.JAVA_HOME}

Passo 1.2: Verificar outras propriedades hardcoded
# Remover/comentar também se existir:
# org.gradle.java.home=/home/seu-usuario/.sdkman/candidates/java/...
# org.gradle.java.home=/Library/Java/JavaVirtualMachines/...

Passo 1.3: Manter apenas propriedades universais
# Manter estas (são cross-platform):
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=2g
org.gradle.parallel=true
org.gradle.caching=true
android.useAndroidX=true
android.enableJetifier=true

### 🟡 TAREFA 2: Atualizar GitHub Actions Workflow
Arquivo: .github/workflows/build-apk.yml (ou nome similar)
Objetivo: Configurar o runner com Java 17 correto antes de executar o Gradle.

Passo 2.1: Adicionar/setup-java action antes do passo de build
# Localizar a seção de jobs -> build-android -> steps
# Adicionar ESTE passo ANTES de "Run Gradle build":

- name: Set up JDK 17
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'
    cache: 'gradle'

Passo 2.2: Garantir que JAVA_HOME seja exportado para o Gradle
# Após setup-java, adicionar este passo (opcional mas recomendado):
- name: Export JAVA_HOME for Gradle
  run: echo "JAVA_HOME=$JAVA_HOME" >> $GITHUB_ENV

Passo 2.3: Atualizar o comando Gradle para não sobrescrever Java home
# No passo de build, garantir que NÃO haja --gradle-java-home ou -Dorg.gradle.java.home
- name: Build APK
  run: |
    cd android
    chmod +x ./gradlew
    ./gradlew assembleRelease --no-daemon
  env:
    GRADLE_OPTS: "-Dorg.gradle.daemon=false -Xmx3g"

### 🟡 TAREFA 3: Workflow Completo Corrigido (Template)
Arquivo: .github/workflows/build-apk.yml
Objetivo: Substituir o workflow inteiro por uma versão funcional e cross-platform.

# Copie e cole este template completo:
name: Build Android APK

on:
  push:
    branches: [main, master]
    paths:
      - 'src/**'
      - 'android/**'
      - 'capacitor.config.ts'
      - 'package.json'
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build Capacitor web assets
      run: npm run build

    - name: Sync Capacitor to Android
      run: npx cap sync android

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
        cache: 'gradle'

    - name: Export JAVA_HOME
      run: echo "JAVA_HOME=$JAVA_HOME" >> $GITHUB_ENV

    - name: Grant execute permission to Gradle
      run: chmod +x android/gradlew

    - name: Build Release APK
      run: |
        cd android
        ./gradlew assembleRelease --no-daemon --stacktrace
      env:
        GRADLE_OPTS: "-Xmx4g -XX:MaxMetaspaceSize=2g"

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: app-release
        path: android/app/build/outputs/apk/release/app-release.apk
        retention-days: 7

    - name: Create GitHub Release (optional)
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      uses: softprops/action-gh-release@v2
      with:
        files: android/app/build/outputs/apk/release/app-release.apk
        tag_name: v${{ github.run_number }}
        name: Release v${{ github.run_number }}
        generate_release_notes: true
        draft: false
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

### 🟢 TAREFA 4: Verificar Configurações do Projeto Android
Arquivo: android/build.gradle (nível do projeto)
Objetivo: Garantir que o Gradle não esteja buscando Java em caminhos fixos.

Passo 4.1: Verificar se há configuração de Java home no build.gradle
# Procurar por:
System.setProperty('org.gradle.java.home', '...') // ❌ REMOVER se existir

# Se precisar definir dinamicamente, use:
if (System.getenv('JAVA_HOME')) {
    System.setProperty('org.gradle.java.home', System.getenv('JAVA_HOME'))
}

Arquivo: android/gradle/wrapper/gradle-wrapper.properties
Objetivo: Garantir versão compatível do Gradle.

Passo 4.2: Verificar distribuição do Gradle
# Manter ou atualizar para versão compatível com JDK 17:
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-all.zip
# OU (se o projeto já usa 9.x e funciona localmente):
distributionUrl=https\://services.gradle.org/distributions/gradle-9.3.1-bin.zip
# Nota: Use -bin.zip em vez de -all.zip para builds de CI (mais rápido, menor download)

### 🔵 TAREFA 5: Adicionar Script de Validação Local (Opcional mas Recomendado)
Arquivo: scripts/validate-ci.sh (ou .ps1 para Windows)
Objetivo: Permitir que desenvolvedores testem localmente se o build vai funcionar no CI.

Passo 5.1: Criar script de validação
#!/bin/bash
# scripts/validate-ci.sh
# Valida se o projeto está configurado para build no GitHub Actions

echo "🔍 Validando configuração para CI..."

# Verificar gradle.properties
if grep -q "org.gradle.java.home=.*/.*:" gradle.properties 2>/dev/null || \
   grep -q "org.gradle.java.home=C:/" gradle.properties 2>/dev/null; then
  echo "❌ ERRO: gradle.properties contém caminho hardcoded de Java"
  echo "   Solução: Remova a linha org.gradle.java.home ou use \${env.JAVA_HOME}"
  exit 1
fi

# Verificar se Java 17 está disponível
if ! command -v java &> /dev/null; then
  echo "⚠️  AVISO: Java não encontrado no PATH"
elif [[ $(java -version 2>&1 | grep -oP 'version "\K[^"]+') < 17 ]]; then
  echo "⚠️  AVISO: Java versão < 17 detectado. CI usará Java 17."
fi

echo "✅ Validação concluída. Projeto pronto para CI."
exit 0

Passo 5.2: Adicionar ao package.json para facilitar execução
{
  "scripts": {
    "validate:ci": "bash scripts/validate-ci.sh",
    "build:android": "npm run build && npx cap sync android && cd android && ./gradlew assembleRelease"
  }
}

## ✅ CRITÉRIOS DE ACEITE (Definition of Done)
- [ ] gradle.properties NÃO contém caminhos absolutos para JDK (C:/, /home/, /Library/)
- [ ] Workflow usa actions/setup-java@v4 com java-version: '17' e distribution: 'temurin'
- [ ] Comando Gradle no workflow NÃO inclui -Dorg.gradle.java.home ou --gradle-java-home
- [ ] gradle-wrapper.properties usa distribuição -bin.zip (mais leve para CI)
- [ ] Teste local: npm run validate:ci passa sem erros
- [ ] Teste CI: Disparar workflow manualmente (workflow_dispatch) → build completa → APK gerado
- [ ] APK gerado é instalável e abre sem tela branca (valida integração com Tarefa anterior)
- [ ] Artefato do APK está disponível na aba "Actions" → "Artifacts" do GitHub

## 🐛 DEBUG & ROLLBACK
Comandos úteis para diagnóstico:
# Testar build localmente simulando ambiente CI
unset JAVA_HOME
./gradlew clean assembleRelease --no-daemon --stacktrace

# Verificar qual Java o Gradle está usando
./gradlew -q javaVersion

# Logs detalhados no GitHub Actions
# Adicionar ao passo de build: --debug ou --info
./gradlew assembleRelease --no-daemon --info

# Verificar variáveis de ambiente no runner
- name: Debug Environment
  run: |
    echo "JAVA_HOME: $JAVA_HOME"
    echo "Java version: $(java -version)"
    echo "Gradle version: $(./gradlew --version | grep Gradle)"

Rollback rápido:
git stash push -u -m "before-ci-fix-$(date +%Y%m%d)"
git checkout HEAD -- android/gradle.properties .github/workflows/build-apk.yml

## 📦 DEPENDÊNCIAS E NOTAS
- actions/setup-java@v4 suporta: temurin, zulu, liberica, microsoft, oracle
- Gradle 8.x+ requer Java 17 mínimo. Gradle 9.x requer Java 17 ou 21.
- Usar -bin.zip em vez de -all.zip no gradle-wrapper.properties reduz download de ~200MB para ~120MB
- O runner ubuntu-latest do GitHub já tem Android SDK pré-instalado. Não é necessário configurar ANDROID_HOME manualmente na maioria dos casos.
- Se o projeto usar signing para release, adicionar secrets no GitHub: ANDROID_KEYSTORE, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD

## 🎯 INSTRUÇÃO FINAL PARA O AGENTE MCP
Você é um engenheiro de DevOps/CI-CD especialista em Capacitor + Android + GitHub Actions. Sua missão é implementar as 5 tarefas deste arquivo na ordem exata.
Regras obrigatórias:
1. NUNCA inclua caminhos absolutos de sistema (C:/, /home/, /Users/) em arquivos versionados
2. Sempre use variáveis de ambiente (JAVA_HOME, ANDROID_HOME) ou actions/setup-* para configuração de ambiente
3. Após modificar gradle.properties, execute npm run validate:ci (ou o script equivalente) para confirmar
4. Teste o workflow com workflow_dispatch antes de considerar a tarefa concluída
5. Se o projeto tiver estrutura diferente (ex: android/app em vez de android/), adapte os caminhos mantendo a lógica
6. Ao finalizar, liste os arquivos modificados e o link direto para o workflow no GitHub Actions
Comece agora pela Tarefa 1. Confirme a conclusão de cada etapa antes de prosseguir.