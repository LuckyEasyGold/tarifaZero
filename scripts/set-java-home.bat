@echo off
REM Script para configurar JAVA_HOME para Java 17

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

echo Configurando JAVA_HOME: %JAVA_HOME_17%
set "JAVA_HOME=%JAVA_HOME_17%"
set "PATH=%JAVA_HOME%\bin;%PATH%"
