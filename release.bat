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

REM Incrementar build number (último dígito da versão)
for /f "tokens=2 delims=:" %%a in ('findstr "version" package.json') do set "version=%%a"
for /f "tokens=1-4 delims=., " %%a in ("%version%") do (
    set "major=%%a"
    set "minor=%%b"
    set "patch=%%c"
    set "build=%%d"
)
set /a newBuild=%build% + 1
set "newVersion=%major%.%minor%.%patch%.%newBuild%"

echo Versao atual: %version%
echo Nova versao: %newVersion%

REM Atualizar package.json
powershell -Command "(Get-Content package.json) -replace '\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\"', '\"version\": \"%newVersion%\"' | Set-Content package.json"

REM Atualizar version.json
powershell -Command "$v = Get-Content public/version.json -Raw | ConvertFrom-Json; $v.version = '%newVersion%'; $v.versionCode = $v.versionCode + 1; $v | ConvertTo-Json -Depth 10 | Set-Content public/version.json"

REM Atualizar build.gradle
powershell -Command "$b = Get-Content android/app/build.gradle -Raw; $b = $b -replace 'versionCode \d+', 'versionCode %newBuild%'; $b = $b -replace 'versionName \"[0-9\.]+\"', 'versionName \"%newVersion%\"'; $b | Set-Content android/app/build.gradle"

REM Atualizar App.tsx
powershell -Command "$a = Get-Content src/App.tsx -Raw; $a = $a -replace \"const currentVersion = '[0-9\.]+';\", \"const currentVersion = '%newVersion%';\"; $a | Set-Content src/App.tsx"

REM Limpar caches
echo Limpando caches...
rmdir /s /q dist android\app\build android\build 2>nul

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
if "%COMMIT_MSG%"=="" set COMMIT_MSG="Lancamento oficial Apk v%newVersion%"

git commit -m "%COMMIT_MSG%"

echo ==============================================
echo [4/4] Enviando para GitHub
echo ==============================================
git push origin main

echo ==============================================
echo [SUCESSO] Commit e push enviados para GitHub!
echo OBS: O Vercel vai automaticamente publicar o novo APK.
echo ==============================================
