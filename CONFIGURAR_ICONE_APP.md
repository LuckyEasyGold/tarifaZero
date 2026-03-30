# 🎨 Configurar Ícone do Aplicativo

## 📱 Ícone do Android

### Passo 1: Gerar Ícones em Múltiplos Tamanhos

Use uma ferramenta online para gerar os ícones:

**Opção 1: Android Asset Studio**
1. Acesse: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Faça upload de `public/logoTarifaZero.png`
3. Ajuste o padding se necessário
4. Clique em "Download"
5. Extraia o ZIP

**Opção 2: Icon Kitchen**
1. Acesse: https://icon.kitchen/
2. Faça upload de `public/logoTarifaZero.png`
3. Escolha "Android" como plataforma
4. Baixe os ícones gerados

### Passo 2: Substituir Ícones no Projeto

Copie os arquivos gerados para as pastas correspondentes:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    ├── ic_launcher_round.png
    └── ic_launcher_foreground.png
```

### Passo 3: Gerar Novo APK

```bash
npm run build
npx cap sync android
cd android
.\gradlew.bat clean assembleDebug
```

---

## 🌐 Favicon do Browser

O favicon já foi configurado no `index.html`:

```html
<link rel="icon" type="image/png" href="/logoTarifaZero.png" />
```

Para melhor compatibilidade, você pode gerar múltiplos tamanhos:

### Gerar Favicons

1. Acesse: https://realfavicongenerator.net/
2. Faça upload de `public/logoTarifaZero.png`
3. Ajuste as configurações para cada plataforma
4. Baixe o pacote gerado
5. Extraia os arquivos para `public/`

### Arquivos Recomendados

```
public/
├── favicon.ico (16x16, 32x32, 48x48)
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png (180x180)
└── android-chrome-192x192.png
```

### Atualizar index.html

```html
<head>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
</head>
```

---

## ✅ Checklist

- [ ] Gerar ícones Android em múltiplos tamanhos
- [ ] Substituir ícones em `android/app/src/main/res/mipmap-*/`
- [ ] Gerar favicons para web
- [ ] Adicionar favicons em `public/`
- [ ] Atualizar `index.html` com links dos favicons
- [ ] Fazer build: `npm run build`
- [ ] Sincronizar: `npx cap sync android`
- [ ] Gerar APK: `cd android && .\gradlew.bat assembleDebug`
- [ ] Testar no celular
- [ ] Fazer deploy no Vercel: `git push`

---

## 🎯 Resultado Esperado

- ✅ Ícone personalizado no Android
- ✅ Favicon personalizado no browser
- ✅ Ícone aparece na tela inicial do celular
- ✅ Favicon aparece na aba do navegador
