#!/bin/bash
# scripts/validate-ci.sh
# Valida se o projeto está configurado para build no GitHub Actions

echo "🔍 Validando configuração para CI..."

# Verificar gradle.properties
if grep -q "^org.gradle.java.home=.*[C-Z]:/" android/gradle.properties 2>/dev/null; then
  echo "❌ ERRO: gradle.properties contém caminho hardcoded de Java (Windows)"
  echo "   Solução: Comente a linha org.gradle.java.home"
  exit 1
fi

if grep -q "^org.gradle.java.home=/home/" android/gradle.properties 2>/dev/null || \
   grep -q "^org.gradle.java.home=/Users/" android/gradle.properties 2>/dev/null; then
  echo "❌ ERRO: gradle.properties contém caminho hardcoded de Java (Unix)"
  echo "   Solução: Comente a linha org.gradle.java.home"
  exit 1
fi

# Verificar se Java 17 está disponível
if ! command -v java &> /dev/null; then
  echo "⚠️  AVISO: Java não encontrado no PATH"
else
  JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[^"]+' | cut -d'.' -f1)
  if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "⚠️  AVISO: Java versão < 17 detectado ($JAVA_VERSION). CI usará Java 17."
  else
    echo "✅ Java $JAVA_VERSION detectado"
  fi
fi

# Verificar se workflow existe
if [ ! -f ".github/workflows/android-build.yml" ]; then
  echo "❌ ERRO: Workflow .github/workflows/android-build.yml não encontrado"
  exit 1
fi

# Verificar se workflow usa setup-java
if ! grep -q "actions/setup-java" .github/workflows/android-build.yml; then
  echo "❌ ERRO: Workflow não usa actions/setup-java"
  exit 1
fi

echo "✅ Validação concluída. Projeto pronto para CI."
exit 0
