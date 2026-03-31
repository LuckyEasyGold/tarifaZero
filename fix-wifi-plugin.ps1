# Script PowerShell para corrigir WifiScanner Plugin
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Corrigindo WifiScanner Plugin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Limpar build
Write-Host "[1/6] Limpando build do Android..." -ForegroundColor Yellow
if (Test-Path "android/app/build") {
    Remove-Item -Recurse -Force "android/app/build"
    Write-Host "Build limpo!" -ForegroundColor Green
} else {
    Write-Host "Pasta build nao encontrada, pulando..." -ForegroundColor Gray
}
Write-Host ""

# 2. Gerar Prisma Client
Write-Host "[2/6] Gerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate
Write-Host ""

# 3. Build frontend
Write-Host "[3/6] Fazendo build do frontend..." -ForegroundColor Yellow
npm run build
Write-Host ""

# 4. Copiar para Android
Write-Host "[4/6] Copiando arquivos para Android..." -ForegroundColor Yellow
npx cap copy android
Write-Host ""

# 5. Sincronizar Capacitor
Write-Host "[5/6] Sincronizando Capacitor..." -ForegroundColor Yellow
npx cap sync android
Write-Host ""

# 6. Atualizar dependências
Write-Host "[6/6] Atualizando dependencias Android..." -ForegroundColor Yellow
npx cap update android
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Correcoes aplicadas!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Abra o Android Studio" -ForegroundColor White
Write-Host "2. Va em File > Invalidate Caches... (CRITICO!)" -ForegroundColor White
Write-Host "3. Marque TODAS as opcoes e clique em 'Invalidate and Restart'" -ForegroundColor White
Write-Host "4. Apos reiniciar: File > Sync Project with Gradle Files" -ForegroundColor White
Write-Host "5. Build > Clean Project" -ForegroundColor White
Write-Host "6. Build > Rebuild Project" -ForegroundColor White
Write-Host "7. Desinstale o app do celular/emulador" -ForegroundColor White
Write-Host "8. Rode novamente pelo Android Studio (Run 'app')" -ForegroundColor White
Write-Host "9. Verifique o Logcat filtrando por 'MainActivity' e depois 'WifiScanner'" -ForegroundColor White
Write-Host ""
Write-Host "Leia o guia completo: ANDROID_STUDIO_STEPS.md" -ForegroundColor Yellow
Write-Host ""
