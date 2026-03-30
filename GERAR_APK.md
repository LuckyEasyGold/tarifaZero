# 📱 Como Gerar o APK - Tarifa Zero

## ✅ Correções Aplicadas

1. **Ranking corrigido** - Não dá mais erro de tela branca
2. **Zoom corrigido** - Não dá mais zoom na tela inteira
3. **API configurada** - APK agora conecta ao banco Neon via Vercel

---

## 🚀 Gerar APK Atualizado

### Passo 1: Build do Frontend

```bash
npm run build
```

### Passo 2: Sincronizar com Android

```bash
npx cap sync android
```

Isso vai:
- Copiar arquivos de `dist/` para `android/app/src/main/assets/public/`
- Atualizar configurações do Capacitor
- Aplicar a URL da API de produção

### Passo 3: Gerar APK

#### Opção A: Via GitHub Actions (Automático)

1. Faça push para o GitHub (já feito!)
2. Aguarde o build automático (~5-10 minutos)
3. Acesse: https://github.com/LuckyEasyGold/tarifaZero/actions
4. Clique no último workflow
5. Baixe o artifact `app-debug`

#### Opção B: Build Local (Manual)

**No Windows (PowerShell):**

```powershell
cd android
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:ANDROID_HOME = "C:\Users\vinic\AppData\Local\Android\Sdk"
.\gradlew.bat assembleDebug
```

**No Linux/Mac:**

```bash
cd android
./gradlew assembleDebug
```

APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

**Requisitos:**
- Java 17 instalado (você tem em: `C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot`)
- Android SDK instalado (você tem em: `C:\Users\vinic\AppData\Local\Android\Sdk`)
- Arquivo `android/local.properties` configurado (já criado)

---

## 📋 Checklist de Teste do APK

Após instalar o APK no celular, teste:

### Tela de Boas-Vindas
- [ ] Splash screen aparece
- [ ] Tela de boas-vindas aparece
- [ ] Aceitar termos funciona
- [ ] Redireciona para o mapa

### Tela Mapa (Home)
- [ ] Mapa carrega
- [ ] Linhas aparecem coloridas
- [ ] Ônibus aparecem e se movem
- [ ] Zoom com pinça funciona (SEM zoom da tela inteira)
- [ ] Arrastar o mapa funciona
- [ ] Menu inferior permanece visível

### Tela Linhas
- [ ] Lista de linhas carrega
- [ ] Clicar em linha abre detalhes
- [ ] Informações aparecem
- [ ] Botão "Ver no Mapa" funciona

### Tela Ranking
- [ ] Ranking carrega (SEM tela branca)
- [ ] Estatísticas aparecem
- [ ] Lista de usuários aparece
- [ ] Filtros funcionam

### Tela Contribuir
- [ ] Localização é solicitada
- [ ] Wi-Fi é detectado (se disponível)
- [ ] Tracking funciona
- [ ] Estatísticas atualizam

---

## 🔧 Configurações Aplicadas

### capacitor.config.ts
```typescript
server: {
  androidScheme: 'https',
  url: 'https://tarifazero.vercel.app',  // API de produção
  cleartext: true
}
```

### index.html
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### Ranking.tsx
- Removida dependência de `data.stats`
- Estatísticas calculadas do array de usuários

### Configuração do Java
- Ajustado de Java 21 para Java 17
- Arquivos modificados:
  - `android/app/capacitor.build.gradle`
  - `android/capacitor-cordova-android-plugins/build.gradle`
  - `android/build.gradle` (configuração global)
  - `android/gradle.properties` (JAVA_HOME)

---

## 🐛 Troubleshooting

### APK não carrega dados

**Problema:** Tela branca ou sem dados

**Solução:**
1. Verifique se fez `npx cap sync android` após o build
2. Verifique se a URL da API está correta no `capacitor.config.ts`
3. Teste a API no navegador: https://tarifazero.vercel.app/api/lines

### Zoom ainda dá problema

**Problema:** Zoom da tela inteira

**Solução:**
1. Verifique se o `index.html` tem `user-scalable=no`
2. Faça build novamente: `npm run build`
3. Sincronize: `npx cap sync android`
4. Gere APK novamente

### Ranking dá tela branca

**Problema:** Erro no console

**Solução:**
1. Verifique se fez pull do código mais recente
2. Faça build novamente
3. Teste no navegador primeiro: http://localhost:5173/ranking

---

## 📊 Fluxo Completo

```
1. Código atualizado no GitHub
   ↓
2. npm run build (gera dist/)
   ↓
3. npx cap sync android (copia para android/)
   ↓
4. ./gradlew assembleDebug (gera APK)
   ↓
5. Instalar APK no celular
   ↓
6. Testar todas as funcionalidades
```

---

## ✅ Resultado Esperado

Após seguir todos os passos:

- ✅ APK instala sem erros
- ✅ Splash screen aparece
- ✅ Dados carregam do banco Neon
- ✅ Mapa funciona com zoom correto
- ✅ Ranking não dá erro
- ✅ Todas as telas funcionam
- ✅ Localização funciona
- ✅ Wi-Fi é detectado

---

**Pronto para gerar o APK!** 🎉

Execute os comandos na ordem e teste no celular.
