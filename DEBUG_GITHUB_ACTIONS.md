# Debug do GitHub Actions - Guia Completo

**Data**: 30/03/2026 21:00  
**Status**: 🔍 Debug ativado

---

## 🎯 Como Acessar os Logs

1. Vá para: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Clique no workflow "Build Android APK"
3. Clique no run mais recente
4. Clique em "build" para expandir os steps
5. Clique em cada step para ver os logs

---

## 🔍 Steps de Debug Adicionados

### 1. Debug - Show environment

Mostra:
- Versão do Node.js
- Versão do NPM
- Diretório de trabalho
- Arquivos na raiz
- Scripts do package.json

**O que verificar**:
- Node.js deve ser v24.x
- NPM deve ser v10.x
- Deve ter `package.json`, `vite.config.ts`, etc.

### 2. Verify Capacitor sync

Mostra:
- Se pasta `android/app/src/main/assets/public` existe
- Conteúdo da pasta de assets

**O que verificar**:
- Pasta deve existir
- Deve ter `index.html`, `assets/`, etc.
- Se não existir, o Capacitor sync falhou

### 3. Build APK with Gradle (com --info)

Mostra:
- Logs detalhados do Gradle
- Cada task executada
- Erros de compilação Java
- Warnings

**O que verificar**:
- Procure por "FAILED" ou "ERROR"
- Verifique se todas as tasks completam
- Veja se há erros de compilação

---

## 🚨 Erros Comuns e Soluções

### Erro 1: "dist folder not found"

**Causa**: Build do Vite falhou

**Como verificar**:
1. Veja o log do step "Build web app"
2. Procure por erros de build

**Solução**:
```bash
# Teste localmente
npm run build

# Se falhar, corrija os erros e faça push
```

### Erro 2: "Capacitor sync failed"

**Causa**: Pasta dist não foi copiada para Android

**Como verificar**:
1. Veja o log do step "Verify Capacitor sync"
2. Veja se pasta public existe

**Solução**:
```bash
# Teste localmente
npm run build
npx cap sync android

# Verifique se pasta foi criada
ls android/app/src/main/assets/public/
```

### Erro 3: "Gradle build failed"

**Causa**: Erro de compilação Java ou Android

**Como verificar**:
1. Veja o log do step "Build APK with Gradle"
2. Procure por "error:" ou "FAILED"
3. Veja qual arquivo Java tem erro

**Solução**:
```bash
# Teste localmente
cd android
./gradlew assembleDebug --stacktrace

# Corrija os erros e faça push
```

### Erro 4: "APK not found"

**Causa**: Build do Gradle completou mas APK não foi gerado

**Como verificar**:
1. Veja o log do step "Verify APK was created"
2. Veja se lista algum APK

**Solução**:
- Verifique se `build.gradle` tem configuração de nome do APK
- Verifique se build do Gradle realmente completou com sucesso

---

## 📊 Interpretando os Logs

### Log Normal (Sucesso)

```
✅ Checkout code
✅ Setup Node.js
✅ Setup Java
✅ Create dummy .env
✅ Install dependencies
✅ Generate Prisma Client
✅ Check TypeScript types
✅ Debug - Show environment
   Node version: v24.x.x
   NPM version: 10.x.x
✅ Build web app
   ✓ 1673 modules transformed.
   ✓ built in 27.30s
✅ Verify dist folder
   dist folder contents:
   index.html
   assets/
✅ Sync Capacitor
✅ Verify Capacitor sync
   ✅ Capacitor sync successful
✅ Grant execute permission for gradlew
✅ Build APK with Gradle
   BUILD SUCCESSFUL in 45s
✅ Verify APK was created
   ✅ APK created successfully!
   TarifaZero.apk (10.4 MB)
✅ Upload APK Artifact
```

### Log com Erro (Exemplo)

```
✅ Checkout code
✅ Setup Node.js
✅ Setup Java
✅ Create dummy .env
✅ Install dependencies
✅ Generate Prisma Client
✅ Check TypeScript types
✅ Debug - Show environment
✅ Build web app
❌ Verify dist folder
   Error: dist folder not found
   Exit code: 1
```

**Ação**: Verificar por que o build do Vite falhou

---

## 🔧 Comandos para Testar Localmente

### 1. Testar Build Completo

```bash
# Limpar tudo
rm -rf dist android/app/build node_modules

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Build do app
npm run build

# Sync Capacitor
npx cap sync android

# Build do APK
cd android
./gradlew assembleDebug --stacktrace
cd ..

# Verificar APK
ls -lh android/app/build/outputs/apk/debug/TarifaZero.apk
```

### 2. Testar Apenas TypeScript

```bash
npx tsc --noEmit
```

### 3. Testar Apenas Build Web

```bash
npm run build
```

### 4. Testar Apenas Capacitor

```bash
npx cap sync android
ls android/app/src/main/assets/public/
```

### 5. Testar Apenas Gradle

```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace --info
cd ..
```

---

## 📝 Checklist de Verificação

Antes de fazer push, verifique:

- [ ] `npm run build` funciona localmente
- [ ] `npx tsc --noEmit` não tem erros
- [ ] Pasta `dist/` é criada com `index.html`
- [ ] `npx cap sync android` funciona
- [ ] Pasta `android/app/src/main/assets/public/` existe
- [ ] `cd android && ./gradlew assembleDebug` funciona
- [ ] APK `TarifaZero.apk` é criado
- [ ] Não há erros de compilação Java

---

## 🎯 Próximos Passos

### Se Build Continuar Falhando

1. **Copie o log completo** do step que falhou
2. **Procure pela palavra "error"** no log
3. **Teste localmente** o comando que falhou
4. **Corrija o erro** localmente
5. **Teste novamente** localmente
6. **Faça push** quando funcionar localmente

### Exemplo de Como Copiar Log

1. Vá para o run falhado
2. Clique no step que falhou
3. Clique em "View raw logs" (canto superior direito)
4. Copie o log completo
5. Cole em um arquivo de texto
6. Procure por "error", "failed", "exception"

---

## 🆘 Se Precisar de Ajuda

Forneça as seguintes informações:

1. **Link do run falhado**: https://github.com/LuckyEasyGold/tarifaZero/actions/runs/XXXXX
2. **Step que falhou**: Nome do step (ex: "Build web app")
3. **Log do erro**: Últimas 50 linhas do log
4. **Teste local**: Resultado de executar o comando localmente

---

## 📊 Monitoramento em Tempo Real

Para acompanhar o build em tempo real:

1. Vá para: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Clique no run "in progress" (amarelo)
3. Clique em "build"
4. Os steps vão aparecendo conforme executam
5. Você pode clicar em cada step para ver o log em tempo real

---

## ✅ Quando o Build Funcionar

Você verá:

1. ✅ Todos os steps verdes
2. 📦 Artifact "tarifazero-debug-apk" disponível
3. ⏱️ Duração: ~5-10 minutos
4. 📱 APK pronto para download

Para baixar:

1. Vá para o run bem-sucedido
2. Role até "Artifacts"
3. Clique em "tarifazero-debug-apk"
4. Baixe o ZIP
5. Extraia o `TarifaZero.apk`

---

## 🎉 Resultado Esperado

```
Build Android APK #XX
✅ Completed in 8m 32s

Artifacts (1)
📦 tarifazero-debug-apk (10.4 MB)
```

---

**Última atualização**: 30/03/2026 21:00  
**Status**: 🔍 Debug ativado - aguardando próximo build
