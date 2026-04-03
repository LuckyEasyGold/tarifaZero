@echo off
echo ==============================================
echo [1/3] Iniciando o release (Build e Cap Sync)
echo ==============================================
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
