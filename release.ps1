# Script de Release Automático - TarifaZero
# Uso: .\release.ps1 "mensagem do commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "🚀 Iniciando processo de release..." -ForegroundColor Cyan

# 1. Ler versão atual
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "📦 Versão atual: $currentVersion" -ForegroundColor Yellow

# 2. Incrementar build number (último dígito)
$versionParts = $currentVersion.Split('.')
$buildNumber = [int]$versionParts[3] + 1
$newVersion = "$($versionParts[0]).$($versionParts[1]).$($versionParts[2]).$buildNumber"
Write-Host "📦 Nova versão: $newVersion" -ForegroundColor Green

# 3. Atualizar package.json
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Write-Host "✅ package.json atualizado" -ForegroundColor Green

# 4. Atualizar version.json
$versionJson = Get-Content "public/version.json" -Raw | ConvertFrom-Json
$versionJson.version = $newVersion
$versionJson.versionCode = $versionJson.versionCode + 1
$versionJson.releaseDate = Get-Date -Format "yyyy-MM-dd"
$versionJson.downloadUrl = "https://tarifazero.vercel.app/TarifaZero-$newVersion.apk"
$versionJson | ConvertTo-Json -Depth 10 | Set-Content "public/version.json"
Write-Host "✅ version.json atualizado (versionCode: $($versionJson.versionCode))" -ForegroundColor Green

# 5. Atualizar build.gradle
$buildGradle = Get-Content "android/app/build.gradle" -Raw
$buildGradle = $buildGradle -replace 'versionCode \d+', "versionCode $($versionJson.versionCode)"
$buildGradle = $buildGradle -replace 'versionName "[\d\.]+"', "versionName `"$newVersion`""
$buildGradle | Set-Content "android/app/build.gradle"
Write-Host "✅ build.gradle atualizado" -ForegroundColor Green

# 6. Limpar caches
Write-Host "🧹 Limpando caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist, android/app/build, android/build -ErrorAction SilentlyContinue

# 7. Build do projeto
Write-Host "🔨 Compilando projeto React..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro no build" -ForegroundColor Red; exit 1 }

# 8. Sync Capacitor
Write-Host "🔄 Sincronizando com Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro no sync" -ForegroundColor Red; exit 1 }

# 9. Build APK
Write-Host "📱 Compilando APK..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
Set-Location android
./gradlew clean assembleDebug
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro ao compilar APK" -ForegroundColor Red; Set-Location ..; exit 1 }
Set-Location ..

# 10. Copiar APK apenas para raiz (NÃO para public - evita APK dentro do APK)
$apkSource = "android/app/build/outputs/apk/debug/TarifaZero-$newVersion.apk"
$apkDestRoot = "TarifaZero-$newVersion.apk"

Copy-Item $apkSource $apkDestRoot -Force

Write-Host "✅ APK copiado para raiz do projeto" -ForegroundColor Green

# 11. Mostrar tamanho do APK
$apkSize = (Get-Item $apkDestRoot).Length / 1MB
Write-Host "📦 Tamanho do APK: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan

# 12. Git commit
Write-Host "📝 Fazendo commit..." -ForegroundColor Yellow
git add -A
git commit -m "v$newVersion - $CommitMessage"
Write-Host "✅ Commit realizado!" -ForegroundColor Green

# 13. Resumo
Write-Host "`n✨ Release concluído com sucesso!" -ForegroundColor Green
Write-Host "📦 Versão: $newVersion" -ForegroundColor Cyan
Write-Host "📱 APK: public/TarifaZero-$newVersion.apk" -ForegroundColor Cyan
Write-Host "🚀 Próximo passo: git push" -ForegroundColor Yellow
