# 📝 Alterações Recentes - 30/03/2026

## ✅ Correções Implementadas

### 1. Favicon Configurado
- ✅ Adicionado `<link rel="icon">` no `index.html` apontando para `/logoTarifaZero.png`
- ✅ Favicon agora aparece nas abas do navegador
- 📄 Arquivo: `index.html`

### 2. Mensagens da Página Contribuir Corrigidas
- ✅ Alterado: "Conecte-se ao Wi-Fi do ônibus" → "Primeiro escolha a rede Wi-Fi do ônibus abaixo"
- ✅ Card de redes WiFi agora é clicável para selecionar a rede
- ✅ Mensagem de instrução adicionada: "Primeiro passo: Escolha a rede Wi-Fi do ônibus abaixo"
- ✅ Redes WiFi ficam com fundo verde quando validadas
- 📄 Arquivo: `src/pages/Contribuir.tsx`

**Fluxo Correto:**
1. Usuário abre página Contribuir
2. App escaneia redes WiFi automaticamente
3. Usuário clica na rede WiFi do ônibus
4. Sistema valida e identifica a linha
5. Botão "Iniciar Tracking" é habilitado
6. Usuário inicia o tracking

### 3. Página de Ranking Corrigida
- ✅ Corrigido erro: `Cannot read properties of undefined (reading 'totalUsers')`
- ✅ API retorna array diretamente, componente agora transforma para o formato esperado
- ✅ Nicknames agora aparecem corretamente
- ✅ Se usuário não tem nickname, aparece `UsuárioXXX` (primeiros 3 caracteres do anonymousId)
- 📄 Arquivo: `src/pages/Ranking.tsx`

**Formato de dados corrigido:**
```javascript
// Antes (esperado mas não retornado pela API):
{ ranking: [...], stats: {...} }

// Agora (transformado no frontend):
const ranking = result.data.map((user, index) => ({
  position: index + 1,
  nickname: user.nickname || `Usuário${user.anonymousId.slice(0, 3)}`,
  // ... outros campos
}));
```

### 4. Configuração do Java para Build Android
- ✅ Ajustado de Java 21 para Java 17
- ✅ Configuração global no `android/build.gradle`
- ✅ Configuração do Kotlin JVM target para 17
- ✅ APK gerado com sucesso (7.5 MB)
- 📄 Arquivos:
  - `android/build.gradle`
  - `android/app/capacitor.build.gradle`
  - `android/capacitor-cordova-android-plugins/build.gradle`
  - `android/gradle.properties`

---

## 📱 Ícone do Aplicativo (Pendente)

Para configurar o ícone do app Android usando `logoTarifaZero.png`:

1. Gerar ícones em múltiplos tamanhos usando: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Substituir arquivos em `android/app/src/main/res/mipmap-*/`
3. Fazer build e sync novamente

📖 Guia completo: `CONFIGURAR_ICONE_APP.md`

---

## 🚀 Como Gerar Novo APK

```bash
# 1. Build do frontend
npm run build

# 2. Sincronizar com Android
npx cap sync android

# 3. Gerar APK
cd android
$env:ANDROID_HOME = "C:\Users\vinic\AppData\Local\Android\Sdk"
.\gradlew.bat clean assembleDebug
```

APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🧪 Testes Necessários

Após instalar o novo APK:

### Página Contribuir
- [ ] Mensagem correta aparece (escolher WiFi, não conectar)
- [ ] Card de redes WiFi é clicável
- [ ] Ao clicar em uma rede, ela é validada
- [ ] Botão "Iniciar Tracking" só habilita após escolher WiFi
- [ ] Tracking funciona normalmente

### Página Ranking
- [ ] Página abre sem erro (sem tela branca)
- [ ] Lista de usuários aparece
- [ ] Nicknames aparecem corretamente
- [ ] Usuários sem nickname aparecem como "UsuárioXXX"
- [ ] Estatísticas aparecem no topo

### Favicon
- [ ] Favicon aparece na aba do navegador (web)
- [ ] Ícone do app aparece na tela inicial (após configurar)

---

## 📦 Arquivos Modificados

1. `index.html` - Favicon adicionado
2. `src/pages/Contribuir.tsx` - Mensagens e fluxo WiFi corrigidos
3. `src/pages/Ranking.tsx` - Transformação de dados da API corrigida
4. `android/build.gradle` - Configuração Java 17
5. `android/app/capacitor.build.gradle` - Java 17
6. `android/capacitor-cordova-android-plugins/build.gradle` - Java 17
7. `android/gradle.properties` - JAVA_HOME configurado

## 📄 Arquivos Criados

1. `CONFIGURAR_ICONE_APP.md` - Guia para configurar ícone do app
2. `ALTERACOES_RECENTES.md` - Este arquivo

---

## 🎯 Próximos Passos

1. Gerar ícones do app em múltiplos tamanhos
2. Substituir ícones no projeto Android
3. Gerar novo APK com ícone personalizado
4. Testar todas as funcionalidades no celular
5. Fazer deploy no Vercel (git push)
