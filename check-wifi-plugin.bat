@echo off
echo ========================================
echo Diagnostico do WifiScanner Plugin
echo ========================================
echo.

echo [1/5] Verificando arquivo WifiScannerPlugin.java...
if exist "android\app\src\main\java\com\newsdrop\tarifazero\WifiScannerPlugin.java" (
    echo [OK] WifiScannerPlugin.java encontrado
) else (
    echo [ERRO] WifiScannerPlugin.java NAO encontrado!
    echo Caminho esperado: android\app\src\main\java\com\newsdrop\tarifazero\WifiScannerPlugin.java
)
echo.

echo [2/5] Verificando arquivo MainActivity.java...
if exist "android\app\src\main\java\com\newsdrop\tarifazero\MainActivity.java" (
    echo [OK] MainActivity.java encontrado
    echo.
    echo Verificando se WifiScannerPlugin esta registrado...
    findstr /C:"registerPlugin(WifiScannerPlugin.class)" "android\app\src\main\java\com\newsdrop\tarifazero\MainActivity.java" >nul
    if errorlevel 1 (
        echo [ERRO] WifiScannerPlugin NAO esta registrado na MainActivity!
    ) else (
        echo [OK] WifiScannerPlugin esta registrado
    )
) else (
    echo [ERRO] MainActivity.java NAO encontrado!
)
echo.

echo [3/5] Verificando package no WifiScannerPlugin.java...
findstr /C:"package com.newsdrop.tarifazero" "android\app\src\main\java\com\newsdrop\tarifazero\WifiScannerPlugin.java" >nul
if errorlevel 1 (
    echo [ERRO] Package incorreto no WifiScannerPlugin.java!
    echo Deve ser: package com.newsdrop.tarifazero;
) else (
    echo [OK] Package correto
)
echo.

echo [4/5] Verificando anotacao @CapacitorPlugin...
findstr /C:"@CapacitorPlugin" "android\app\src\main\java\com\newsdrop\tarifazero\WifiScannerPlugin.java" >nul
if errorlevel 1 (
    echo [ERRO] Anotacao @CapacitorPlugin nao encontrada!
) else (
    echo [OK] Anotacao @CapacitorPlugin encontrada
    findstr /C:"name = \"WifiScanner\"" "android\app\src\main\java\com\newsdrop\tarifazero\WifiScannerPlugin.java" >nul
    if errorlevel 1 (
        echo [AVISO] Nome do plugin pode estar incorreto
    ) else (
        echo [OK] Nome do plugin: WifiScanner
    )
)
echo.

echo [5/5] Verificando permissoes no AndroidManifest.xml...
findstr /C:"NEARBY_WIFI_DEVICES" "android\app\src\main\AndroidManifest.xml" >nul
if errorlevel 1 (
    echo [AVISO] Permissao NEARBY_WIFI_DEVICES nao encontrada
) else (
    echo [OK] Permissao NEARBY_WIFI_DEVICES encontrada
)

findstr /C:"ACCESS_FINE_LOCATION" "android\app\src\main\AndroidManifest.xml" >nul
if errorlevel 1 (
    echo [AVISO] Permissao ACCESS_FINE_LOCATION nao encontrada
) else (
    echo [OK] Permissao ACCESS_FINE_LOCATION encontrada
)

findstr /C:"ACCESS_WIFI_STATE" "android\app\src\main\AndroidManifest.xml" >nul
if errorlevel 1 (
    echo [AVISO] Permissao ACCESS_WIFI_STATE nao encontrada
) else (
    echo [OK] Permissao ACCESS_WIFI_STATE encontrada
)
echo.

echo ========================================
echo Diagnostico Concluido!
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo 1. Se todos os checks estao [OK], o problema esta no Android Studio
echo 2. Siga o guia: ANDROID_STUDIO_STEPS.md
echo 3. CRITICO: Invalidar cache do Android Studio
echo 4. Desinstalar app antigo do celular
echo 5. Verificar Logcat para ver se plugin foi registrado
echo.
pause
