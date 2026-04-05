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

# 3. Remover APK antigo da raiz
Write-Host "🗑️  Removendo APK antigo..." -ForegroundColor Yellow
$oldApks = Get-ChildItem -Path . -Filter "TarifaZero-*.apk" -File
foreach ($oldApk in $oldApks) {
    Remove-Item $oldApk.FullName -Force
    Write-Host "   Removido: $($oldApk.Name)" -ForegroundColor Gray
}

# 4. Atualizar package.json
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Write-Host "✅ package.json atualizado" -ForegroundColor Green

# 5. Atualizar version.json
$versionJson = Get-Content "public/version.json" -Raw | ConvertFrom-Json
$oldVersionCode = $versionJson.versionCode
$versionJson.version = $newVersion
$versionJson.versionCode = $oldVersionCode + 1
$versionJson.releaseDate = Get-Date -Format "yyyy-MM-dd"
$versionJson.downloadUrl = "https://tarifazero.vercel.app/TarifaZero-$newVersion.apk"
$versionJson | ConvertTo-Json -Depth 10 | Set-Content "public/version.json"
Write-Host "✅ version.json atualizado (versionCode: $($versionJson.versionCode))" -ForegroundColor Green

# 6. Atualizar build.gradle
$buildGradle = Get-Content "android/app/build.gradle" -Raw
$buildGradle = $buildGradle -replace 'versionCode \d+', "versionCode $($versionJson.versionCode)"
$buildGradle = $buildGradle -replace 'versionName "[\d\.]+"', "versionName `"$newVersion`""
$buildGradle | Set-Content "android/app/build.gradle"
Write-Host "✅ build.gradle atualizado" -ForegroundColor Green

# 7. Atualizar versão no App.tsx (para limpeza de cache)
$appTsx = Get-Content "src/App.tsx" -Raw
$appTsx = $appTsx -replace "const currentVersion = '[\d\.]+';", "const currentVersion = '$newVersion';"
$appTsx | Set-Content "src/App.tsx"
Write-Host "✅ App.tsx atualizado com nova versão" -ForegroundColor Green

# 8. Limpar caches
Write-Host "🧹 Limpando caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist, android/app/build, android/build -ErrorAction SilentlyContinue

# 9. Build do projeto
Write-Host "🔨 Compilando projeto React..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro no build" -ForegroundColor Red; exit 1 }

# 10. Sync Capacitor
Write-Host "🔄 Sincronizando com Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro no sync" -ForegroundColor Red; exit 1 }

# 11. Build APK
Write-Host "📱 Compilando APK..." -ForegroundColor Yellow

# Detectar e configurar JAVA_HOME para Java 17
$javaHome17 = $null
$possiblePaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\OpenJDK\jdk-17",
    "C:\Program Files\Eclipse Adoptium\jdk-17*"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $javaHome17 = $path
        break
    }
    # Tentar com wildcard
    $found = Get-ChildItem -Path (Split-Path $path) -Filter (Split-Path $path -Leaf) -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $javaHome17 = $found.FullName
        break
    }
}

if (-not $javaHome17) {
    Write-Host "❌ Java 17 não encontrado!" -ForegroundColor Red
    Write-Host "   Instale o Java 17 de: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}

Write-Host "   Usando Java: $javaHome17" -ForegroundColor Gray
$env:JAVA_HOME = $javaHome17

Set-Location android
./gradlew clean assembleDebug
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro ao compilar APK" -ForegroundColor Red; Set-Location ..; exit 1 }
Set-Location ..

# 12. Copiar APK apenas para raiz (NÃO para public)
$apkSource = "android/app/build/outputs/apk/debug/TarifaZero-$newVersion.apk"
$apkDestRoot = "TarifaZero-$newVersion.apk"

Copy-Item $apkSource $apkDestRoot -Force
Write-Host "✅ APK copiado para raiz do projeto" -ForegroundColor Green

# 13. Mostrar tamanho do APK
$apkSize = (Get-Item $apkDestRoot).Length / 1MB
Write-Host "📦 Tamanho do APK: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan

# 14. Git commit (inclui remoção do APK antigo)
Write-Host "📝 Fazendo commit..." -ForegroundColor Yellow
git add -A
git commit -m "v$newVersion - $CommitMessage"
Write-Host "✅ Commit realizado!" -ForegroundColor Green

# 15. Resumo
Write-Host "`n✨ Release concluído com sucesso!" -ForegroundColor Green
Write-Host "📦 Versão: $newVersion (versionCode: $($versionJson.versionCode))" -ForegroundColor Cyan
Write-Host "📱 APK: TarifaZero-$newVersion.apk ($([math]::Round($apkSize, 2)) MB)" -ForegroundColor Cyan
Write-Host "🗑️  APK antigo removido automaticamente" -ForegroundColor Cyan
Write-Host "🚀 Próximo passo: git push" -ForegroundColor Yellow
Write-Host "`n💡 Dica: O Vercel vai automaticamente:" -ForegroundColor Gray
Write-Host "   - Remover o APK antigo" -ForegroundColor Gray
Write-Host "   - Publicar o novo APK em: https://tarifazero.vercel.app/TarifaZero-$newVersion.apk" -ForegroundColor Gray
