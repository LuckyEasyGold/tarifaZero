@echo off
echo ==============================================
echo [1/3] Iniciando o release (Build e Cap Sync)
echo ==============================================

REM Detectar e configurar JAVA_HOME para Java 17
set "JAVA_HOME_17="
if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot" (
    set "JAVA_HOME_17=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
) else if exist "C:\Program Files\Java\jdk-17" (
    set "JAVA_HOME_17=C:\Program Files\Java\jdk-17"
) else if exist "C:\Program Files\OpenJDK\jdk-17" (
    set "JAVA_HOME_17=C:\Program Files\OpenJDK\jdk-17"
)

if "%JAVA_HOME_17%"=="" (
    echo [ERRO] Java 17 nao encontrado!
    echo Instale o Java 17 de: https://adoptium.net/
    exit /b 1
)

echo Usando Java: %JAVA_HOME_17%
set "JAVA_HOME=%JAVA_HOME_17%"

call npm run release:apk
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar ou copiar o APK!
    exit /b %errorlevel%
)

echo ==============================================
echo [2/3] Adicionando e preparando GitHub
echo ==============================================
git add .

echo ==============================================
echo [3/3] Criando commit oficial
echo ==============================================
set COMMIT_MSG=%~1
if "%COMMIT_MSG%"=="" set COMMIT_MSG="Lancamento oficial Apk"

git commit -m "%COMMIT_MSG%"

echo ==============================================
echo [SUCESSO] Commit criado com sucesso! Tudo salvo no controle de versaio.
echo OBS: Nao esqueca de dar 'git push' para subir no Github e ligar para a Vercel.
echo ==============================================
