# Script PowerShell para gerar APK localmente
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gerando APK do Tarifa Zero" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Gerar Prisma Client
Write-Host "[1/5] Gerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao gerar Prisma Client!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Build do frontend
Write-Host "[2/5] Fazendo build do frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build do frontend!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Sincronizar Capacitor
Write-Host "[3/5] Sincronizando Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao sincronizar Capacitor!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Build do APK com Gradle
Write-Host "[4/5] Compilando APK com Gradle..." -ForegroundColor Yellow
Write-Host "Isso pode demorar alguns minutos..." -ForegroundColor Gray
Set-Location android
.\gradlew assembleDebug --no-daemon
$gradleExitCode = $LASTEXITCODE
Set-Location ..

if ($gradleExitCode -ne 0) {
    Write-Host "Erro ao compilar APK!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Copiar APK para pasta public
Write-Host "[5/5] Copiando APK para pasta public..." -ForegroundColor Yellow
$apkSource = "android\app\build\outputs\apk\debug\TarifaZero.apk"
$apkDest = "public\TarifaZero.apk"

if (Test-Path $apkSource) {
    Copy-Item $apkSource $apkDest -Force
    Write-Host "APK copiado com sucesso!" -ForegroundColor Green
    
    # Mostrar informações do APK
    $apkSize = (Get-Item $apkDest).Length / 1MB
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "APK Gerado com Sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Localização: $apkDest" -ForegroundColor White
    Write-Host "Tamanho: $([math]::Round($apkSize, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host "1. Testar o APK no celular" -ForegroundColor White
    Write-Host "2. Se OK, commitar e enviar para GitHub:" -ForegroundColor White
    Write-Host "   git add public/TarifaZero.apk" -ForegroundColor Gray
    Write-Host "   git commit -m 'chore: atualiza APK v2.2.0'" -ForegroundColor Gray
    Write-Host "   git push origin main" -ForegroundColor Gray
    Write-Host "3. Vercel vai fazer deploy automaticamente" -ForegroundColor White
    Write-Host "4. APK estará disponível em:" -ForegroundColor White
    Write-Host "   https://tarifazero.vercel.app/TarifaZero.apk" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Erro: APK não encontrado em $apkSource" -ForegroundColor Red
    exit 1
}
