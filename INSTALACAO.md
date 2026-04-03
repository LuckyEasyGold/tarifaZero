# 📱 Guia de Instalação - Tarifa Zero

## 🔧 Problema: Tela Branca ou App não Atualiza

Se você instalou uma nova versão e o app mostra tela branca ou não atualiza, siga estes passos:

### ✅ Solução Completa (Recomendado)

1. **Desinstale o app completamente**
   - Configurações → Apps → Tarifa Zero → Desinstalar

2. **Limpe o cache do Android System WebView**
   - Configurações → Apps → Android System WebView
   - Armazenamento → Limpar cache
   - Armazenamento → Limpar dados

3. **Limpe o cache do Google Chrome** (se instalado)
   - Configurações → Apps → Chrome
   - Armazenamento → Limpar cache

4. **Reinicie o celular**

5. **Instale o novo APK**
   - Baixe `TarifaZero-X.X.X.X.apk`
   - Instale normalmente

---

## 🚀 Instalação Normal

### Primeira Instalação

1. Baixe o APK mais recente: `TarifaZero-2.4.2.0.apk`
2. Abra o arquivo
3. Permita "Instalar de fontes desconhecidas" se solicitado
4. Clique em "Instalar"
5. Abra o app

### Atualização

O app detecta automaticamente quando há uma nova versão disponível e mostra uma notificação no topo da tela.

**Passos**:
1. Clique em "Baixar Atualização"
2. Baixe o novo APK
3. Instale por cima (não precisa desinstalar)
4. Se der tela branca, siga a "Solução Completa" acima

---

## 🔍 Por que acontece a tela branca?

O Android usa um componente chamado **WebView** para exibir conteúdo web dentro de apps. Quando você atualiza o app, o WebView pode manter arquivos antigos em cache, causando conflitos.

### O que o app faz automaticamente:

- Detecta mudança de versão
- Limpa cache do app
- Força reload

### O que você precisa fazer manualmente:

- Limpar cache do **Android System WebView** (componente do sistema)
- Reiniciar o celular (opcional, mas recomendado)

---

## 📋 Checklist de Instalação

- [ ] Desinstalei o app antigo
- [ ] Limpei cache do Android System WebView
- [ ] Limpei cache do Chrome (se instalado)
- [ ] Reiniciei o celular
- [ ] Instalei o novo APK
- [ ] App abriu normalmente

---

## 🆘 Ainda não funciona?

Se após seguir todos os passos o app ainda não funcionar:

1. Verifique se o APK foi baixado completamente (tamanho ~10 MB)
2. Tente baixar novamente
3. Verifique se seu Android é versão 7.0 ou superior
4. Entre em contato: viniciusribramos@gmail.com

---

## 📦 Versões Disponíveis

- **Atual**: 2.4.2.0
- **Download**: https://tarifazero.vercel.app/TarifaZero-2.4.2.0.apk
- **Changelog**: Veja em `public/version.json`
