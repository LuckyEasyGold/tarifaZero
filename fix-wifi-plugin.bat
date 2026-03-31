@echo off
echo ========================================
echo Corrigindo WifiScanner Plugin
echo ========================================
echo.

echo [1/6] Limpando build do Android...
if exist android\app\build (
    rmdir /s /q android\app\build
    echo Build limpo!
) else (
    echo Pasta build nao encontrada, pulando...
)
echo.

echo [2/6] Gerando Prisma Client...
call npm run db:generate
echo.

echo [3/6] Fazendo build do frontend...
call npm run build
echo.

echo [4/6] Copiando arquivos para Android...
call npx cap copy android
echo.

echo [5/6] Sincronizando Capacitor...
call npx cap sync android
echo.

echo [6/6] Atualizando dependencias Android...
call npx cap update android
echo.

echo ========================================
echo Correcoes aplicadas!
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo 1. Abra o Android Studio
echo 2. Va em File ^> Sync Project with Gradle Files
echo 3. Desinstale o app do celular/emulador
echo 4. Rode novamente pelo Android Studio (Run 'app')
echo 5. Verifique o Logcat filtrando por "WifiScanner"
echo.
pause
