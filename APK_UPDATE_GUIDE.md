# 🚀 Guia Completo: Atualização de APK com GitHub Actions

## ✅ O Que Foi Configurado

### 1. Workflow do GitHub Actions (`.github/workflows/build-android.yml`)
- Acionado automaticamente ao criar tags versionadas (`v1.0.0`, `v1.0.1`, etc.)
- Baixa o keystore das secrets do repositório
- Configura o Gradle para assinar o APK com sua chave
- Gera um APK **assinado corretamente** na pasta `android/app/build/outputs/apk/release/`
- Cria um Release no GitHub com o APK anexado

### 2. Build Gradle (`android/app/build.gradle`)
- Adicionado `signingConfigs` para suportar assinatura via `gradle.properties`
- Configuração condicional: se as propriedades de assinatura existirem, usa a chave; caso contrário, build sem assinatura (debug)

---

## 🔑 Passo 1: Gerar o Keystore (FAÇA ISSO UMA VEZ)

No seu computador local (requer Java instalado):

```bash
keytool -genkey -v \
  -keystore tarifarzo-release.jks \
  -alias tarifarzo \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Você será perguntado sobre:**
- Senha do keystore (anote!)
- Nome completo, organização, cidade, etc. (pode preencher ou deixar em branco)
- Senha da chave (geralmente a mesma do keystore)

**Guarde estas informações:**
- 📁 Arquivo: `tarifarzo-release.jks`
- 🔑 Alias: `tarifarzo`
- 🔐 Senha do keystore
- 🔐 Senha da chave

---

## 🔄 Passo 2: Codificar o Keystore em Base64

### Linux/Mac:
```bash
base64 tarifarzo-release.jks > tarifarzo-base64.txt
```

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("tarifarzo-release.jks")) | Out-File -Encoding ASCII tarifarzo-base64.txt
```

Abra o arquivo `tarifarzo-base64.txt` e copie TODO o conteúdo (uma linha longa).

---

## 🔒 Passo 3: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret** 4 vezes para adicionar:

| Nome da Secret | Valor | Exemplo |
|----------------|-------|---------|
| `ANDROID_KEYSTORE_BASE64` | Conteúdo do arquivo base64 | `MIIJ... (linha longa)` |
| `ANDROID_KEY_ALIAS` | Alias que você criou | `tarifarzo` |
| `ANDROID_STORE_PASSWORD` | Senha do keystore | `minhasenha123` |
| `ANDROID_KEY_PASSWORD` | Senha da chave | `minhasenha123` |

⚠️ **NUNCA commit o arquivo `.jks` no repositório!** Mantenha backup em:
- Google Drive / OneDrive
- HD externo
- Gerenciador de senhas (Bitwarden, 1Password)

---

## 🏷️ Passo 4: Gerar Nova Versão e Publicar

### Opção A: Script Automático (Recomendado)

```bash
# 1. Atualiza versão no package.json e android/app/build.gradle
npm version patch  # ou minor, ou major

# 2. Cria tag git
git tag v2.5.0.5

# 3. Push com tags
git push origin main --tags
```

### Opção B: Manual

1. Edite `package.json` e `android/app/build.gradle`:
   ```json
   "version": "2.5.0.5"
   ```
   ```gradle
   versionCode 24
   versionName "2.5.0.5"
   ```

2. Commit e push:
   ```bash
   git add .
   git commit -m "chore: release v2.5.0.5"
   git tag v2.5.0.5
   git push origin main --tags
   ```

3. Ou acione manualmente no GitHub:
   - Vá em **Actions** → **Build and Release Android APK**
   - Clique em **Run workflow**

---

## 📲 Passo 5: Baixar e Testar

1. Após o workflow completar (5-10 min), vá em **Releases** no GitHub
2. Baixe o APK mais recente
3. Instale no dispositivo Android
4. Quando lançar uma nova versão, teste a atualização:
   - O app deve detectar nova versão
   - Usuário clica para atualizar
   - APK baixa e instala **sem erros**

---

## 🛠️ Sistema de Atualização no App

### Service Worker já configurado em `public/sw.js`:
- Cache versionado (`v2`)
- Limpeza automática de caches antigos
- Estratégia Network First para API

### Para adicionar prompt de atualização no frontend:

```tsx
// src/components/UpdatePrompt.tsx
import { useEffect, useState } from 'react';

export function UpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateReady(true); // Nova versão disponível!
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
  };

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <p>Nova versão disponível!</p>
      <button 
        onClick={handleUpdate}
        className="mt-2 bg-white text-blue-600 px-4 py-2 rounded font-bold"
      >
        Atualizar Agora
      </button>
    </div>
  );
}
```

---

## ❌ Troubleshooting

### Erro: "App not installed"
**Causa:** APK assinado com chave diferente  
**Solução:** 
- Verifique se as secrets estão corretas
- Confirme que está usando o MESMO keystore de sempre

### Erro: "Package conflicts with an existing package"
**Causa:** Mismatch de `applicationId` ou assinatura  
**Solução:**
- Verifique `applicationId` em `android/app/build.gradle`: deve ser `com.newsdrop.tarifazero`
- Confirme que o keystore é o mesmo

### Workflow falha em "Create Keystore from Secrets"
**Causa:** Base64 corrompido ou senha incorreta  
**Solução:**
- Regere o base64 do keystore
- Verifique se não há espaços ou quebras no valor da secret
- Teste as senhas manualmente

### APK não é gerado
**Causa:** Build falhou ou caminho incorreto  
**Solução:**
- Verifique logs do workflow
- Confirme que `npx cap sync android` completou
- Teste build local: `cd android && ./gradlew assembleRelease`

---

## 📋 Checklist de Lançamento

- [ ] Atualizar versão em `package.json`
- [ ] Atualizar versão em `android/app/build.gradle` (versionCode e versionName)
- [ ] Commit e tag git (`vX.Y.Z`)
- [ ] Push com `--tags`
- [ ] Aguardar workflow completar
- [ ] Baixar APK do Release
- [ ] Testar instalação
- [ ] Testar atualização (se já houver versão instalada)

---

## 🎯 Resumo

| Antes | Depois |
|-------|--------|
| APK sem assinatura consistente | APK sempre assinado com mesma chave |
| Erro ao atualizar | Atualização funciona perfeitamente |
| Processo manual | Automatizado via GitHub Actions |
| Sem versionamento claro | Tags git + Releases organizados |

**Próxima ação:** Gere seu keystore e configure as secrets no GitHub!
