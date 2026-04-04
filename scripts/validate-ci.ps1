# scripts/validate-ci.ps1
# Valida se o projeto esta configurado para build no GitHub Actions

Write-Host "Validando configuracao para CI..." -ForegroundColor Cyan

# Verificar gradle.properties
$gradleProps = Get-Content "android/gradle.properties" -ErrorAction SilentlyContinue
if ($gradleProps -match "^org.gradle.java.home=.*[C-Z]:/") {
    Write-Host "ERRO: gradle.properties contem caminho hardcoded de Java (Windows)" -ForegroundColor Red
    Write-Host "Solucao: Comente a linha org.gradle.java.home" -ForegroundColor Yellow
    exit 1
}

if ($gradleProps -match "^org.gradle.java.home=/home/" -or $gradleProps -match "^org.gradle.java.home=/Users/") {
    Write-Host "ERRO: gradle.properties contem caminho hardcoded de Java (Unix)" -ForegroundColor Red
    Write-Host "Solucao: Comente a linha org.gradle.java.home" -ForegroundColor Yellow
    exit 1
}

# Verificar se Java 17 esta disponivel
try {
    $javaOutput = java -version 2>&1 | Out-String
    if ($javaOutput -match "version `"(\d+)") {
        $javaVersion = $Matches[1]
        $javaNum = [int]$javaVersion
        if ($javaNum -lt 17) {
            Write-Host "AVISO: Java versao menor que 17 detectado ($javaVersion). CI usara Java 17." -ForegroundColor Yellow
        } else {
            Write-Host "Java $javaVersion detectado" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "AVISO: Java nao encontrado no PATH" -ForegroundColor Yellow
}

# Verificar se workflow existe
if (-not (Test-Path ".github/workflows/android-build.yml")) {
    Write-Host "ERRO: Workflow .github/workflows/android-build.yml nao encontrado" -ForegroundColor Red
    exit 1
}

# Verificar se workflow usa setup-java
$workflow = Get-Content ".github/workflows/android-build.yml" -Raw
if ($workflow -notmatch "actions/setup-java") {
    Write-Host "ERRO: Workflow nao usa actions/setup-java" -ForegroundColor Red
    exit 1
}

Write-Host "Validacao concluida. Projeto pronto para CI." -ForegroundColor Green
exit 0
