# Correção do Erro "Gradle requires JVM 17 or later"

## Problema

Ao executar `release.bat` ou `npm run android:build`, você recebe o erro:

```
FAILURE: Build failed with an exception.
* What went wrong:
Gradle requires JVM 17 or later to run. Your build is currently configured to use JVM 8.
```

## Causa

A variável de ambiente `JAVA_HOME` está apontando para Java 8, mas o Gradle 9.3.1 requer Java 17 ou superior.

## Soluções

### Solução 1: Usar release.ps1 (Recomendado)

O script PowerShell detecta automaticamente o Java 17:

```powershell
.\release.ps1 "mensagem do commit"
```

### Solução 2: Configurar JAVA_HOME Permanentemente

1. Abra as Variáveis de Ambiente do Windows:
   - Pressione `Win + R`
   - Digite `sysdm.cpl` e pressione Enter
   - Vá para a aba "Avançado"
   - Clique em "Variáveis de Ambiente"

2. Em "Variáveis do sistema", encontre `JAVA_HOME`

3. Edite para apontar para o Java 17:
   ```
   C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
   ```

4. Reinicie o PowerShell/CMD

### Solução 3: Configurar JAVA_HOME Temporariamente

Antes de executar o build, configure manualmente:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
npm run android:build
```

Ou no CMD:

```cmd
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
npm run android:build
```

### Solução 4: Usar o Script Atualizado

O `release.bat` foi atualizado para detectar automaticamente o Java 17:

```cmd
.\release.bat
```

## Verificar Instalação do Java

Para verificar qual Java está instalado:

```powershell
# Ver versão do Java no PATH
java -version

# Ver JAVA_HOME atual
echo $env:JAVA_HOME

# Listar todas as instalações do Java
Get-ChildItem "C:\Program Files\Java", "C:\Program Files\Eclipse Adoptium", "C:\Program Files\OpenJDK" -ErrorAction SilentlyContinue
```

## Instalar Java 17

Se você não tem o Java 17 instalado:

1. Baixe de: https://adoptium.net/
2. Escolha: OpenJDK 17 (LTS)
3. Instale e anote o caminho de instalação
4. Configure o `JAVA_HOME` conforme Solução 2

## Scripts Atualizados

Os seguintes scripts foram atualizados para detectar automaticamente o Java 17:

- `release.ps1` - Detecta automaticamente
- `release.bat` - Detecta automaticamente
- `scripts/set-java-home.bat` - Helper para configurar JAVA_HOME

## Notas

- O GitHub Actions usa Java 17 automaticamente (configurado no workflow)
- Localmente, você precisa ter Java 17 instalado e configurado
- O Gradle 9.3.1 requer Java 17 mínimo
- Ter múltiplas versões do Java instaladas é normal, basta configurar o `JAVA_HOME` corretamente


## ✅ Problema Resolvido!

### Correções Implementadas:

1. **release.bat** - Detecta automaticamente Java 17 e configura JAVA_HOME
2. **release.ps1** - Detecta automaticamente Java 17 e configura JAVA_HOME
3. **scripts/copy-apk.cjs** - Copia o APK usando a versão do package.json dinamicamente
4. **package.json** - Script `release:apk` atualizado para usar o novo script

### Como Usar Agora:

```cmd
.\release.bat
```

Ou:

```powershell
.\release.ps1 "mensagem do commit"
```

O script agora:
- ✅ Detecta automaticamente o Java 17
- ✅ Configura o JAVA_HOME temporariamente
- ✅ Compila o projeto React
- ✅ Sincroniza com Capacitor
- ✅ Compila o APK com Gradle
- ✅ Copia o APK para a raiz do projeto com o nome correto
- ✅ Mostra o tamanho do APK
- ✅ Fornece instruções para o próximo passo (git push)

### Resultado Esperado:

```
BUILD SUCCESSFUL in 1m 28s
✅ APK copiado: TarifaZero-2.5.0.1.apk
📦 Tamanho: 14.29 MB

💡 Próximos passos:
   git add TarifaZero-2.5.0.1.apk
   git commit -m "release: v2.5.0.1"
   git push
```
