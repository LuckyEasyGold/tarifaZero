# 🚀 Como Liberar uma Nova Versão do Tarifa Zero

**Versão Atual**: 2.1.0 (versionCode: 2)

---

## 📋 Quando Liberar Nova Versão?

### PATCH (2.1.0 → 2.1.1)
- Correções de bugs
- Pequenas melhorias de UI
- Ajustes de texto
- **versionCode**: +1

### MINOR (2.1.0 → 2.2.0)
- Novas funcionalidades
- Melhorias significativas
- Novos recursos
- **versionCode**: +1

### MAJOR (2.1.0 → 3.0.0)
- Mudanças incompatíveis
- Redesign completo
- Mudanças na arquitetura
- **versionCode**: +1

---

## ✅ Checklist Completo

### 1. Testar Localmente

```powershell
# Build local
npm run build

# Testar no Android Studio
npx cap open android
# Run 'app' e testar todas as funcionalidades
```

**Verificar**:
- [ ] App abre sem erros
- [ ] Todas as páginas funcionam
- [ ] WiFi Scanner funciona (se APK)
- [ ] GPS funciona
- [ ] Botões funcionam
- [ ] Sem crashes

---

### 2. Atualizar Versão (4 lugares)

#### A. `package.json`
```json
{
  "version": "2.2.0"  // ← Atualizar aqui
}
```

#### B. `android/app/build.gradle`
```gradle
defaultConfig {
    versionCode 3           // ← Incrementar (+1)
    versionName "2.2.0"     // ← Atualizar aqui
}
```

#### C. `public/version.json`
```json
{
  "version": "2.2.0",       // ← Atualizar
  "versionCode": 3,         // ← Incrementar
  "releaseDate": "2026-04-01",  // ← Data de hoje
  "downloadUrl": "https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.2.0/TarifaZero.apk",
  "changelog": [
    "✅ Nova funcionalidade X",
    "✅ Correção do bug Y",
    "✅ Melhoria Z"
  ],
  "minVersion": "2.0.0",
  "forceUpdate": false      // ← true se obrigatória
}
```

#### D. `api/index.js` (endpoint /version)
```javascript
if (path === '/version' && req.method === 'GET') {
  return res.status(200).json({
    success: true,
    data: {
      version: "2.2.0",      // ← Atualizar
      versionCode: 3,        // ← Incrementar
      releaseDate: "2026-04-01",
      downloadUrl: "https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.2.0/TarifaZero.apk",
      changelog: [
        "✅ Nova funcionalidade X",
        "✅ Correção do bug Y"
      ],
      minVersion: "2.0.0",
      forceUpdate: false     // ← true se obrigatória
    }
  });
}
```

---

### 3. Commitar e Enviar

```powershell
git add .
git commit -m "chore: bump version to 2.2.0"
git push origin main
```

---

### 4. Aguardar GitHub Actions

1. Ir em: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Aguardar workflow "Build Android APK" concluir (~5-10 min)
3. Verificar se passou sem erros ✅

---

### 5. Baixar e Testar APK

1. No workflow concluído, clicar em "Artifacts"
2. Baixar "tarifazero-debug-apk"
3. Extrair o ZIP
4. Instalar `TarifaZero.apk` no celular
5. **TESTAR TUDO NOVAMENTE**

**Verificar**:
- [ ] App instala sem erros
- [ ] Todas as funcionalidades funcionam
- [ ] WiFi Scanner funciona
- [ ] GPS funciona
- [ ] Sem crashes

---

### 6. Criar Release no GitHub

Só criar release DEPOIS de testar o APK!

1. Ir em: https://github.com/LuckyEasyGold/tarifaZero/releases
2. Clicar em "Draft a new release"
3. Preencher:
   - **Tag**: `v2.2.0` (criar nova tag)
   - **Title**: `Tarifa Zero v2.2.0`
   - **Description**:
     ```markdown
     ## 🎉 Novidades
     
     - ✅ Nova funcionalidade X
     - ✅ Correção do bug Y
     - ✅ Melhoria Z
     
     ## 📱 Instalação
     
     1. Baixe o arquivo `TarifaZero.apk` abaixo
     2. Instale no seu Android
     3. Aproveite!
     
     ## 📊 Versão
     
     - Versão: 2.2.0
     - Código: 3
     - Data: 01/04/2026
     ```
4. **Anexar o APK testado** (arrastar arquivo)
5. Clicar em "Publish release"

---

### 7. Atualizar URL no version.json

Após criar o release, a URL do APK estará disponível:

```
https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.2.0/TarifaZero.apk
```

**Verificar se a URL está correta** em:
- `public/version.json`
- `api/index.js` (endpoint /version)

Se precisar corrigir:

```powershell
# Editar os arquivos
# Commitar
git add .
git commit -m "fix: atualiza URL do APK no version.json"
git push origin main
```

---

## 🔔 Como Funciona a Notificação de Atualização

### No App (APK)

Quando o usuário abre o app:

1. **UpdateNotification.tsx** verifica `/api/version`
2. Compara `versionCode` local vs servidor
3. Se servidor > local: Mostra banner no topo

**Banner mostra**:
- Título: "🎉 Nova Versão Disponível!" ou "⚠️ Atualização Obrigatória"
- Versão: v2.2.0
- Changelog (primeiros 3 itens)
- Botão "Baixar Atualização" → Abre GitHub Release

**Tipos de Atualização**:

#### Opcional (`forceUpdate: false`)
- Usuário pode dispensar
- Banner desaparece até próxima sessão
- Botão X para fechar

#### Obrigatória (`forceUpdate: true`)
- Usuário NÃO pode dispensar
- Banner sempre visível
- Sem botão X
- Use apenas para correções críticas de segurança

---

## 📝 Exemplo Completo

### Cenário: Corrigir bug crítico

**1. Atualizar versão**: 2.1.0 → 2.1.1 (PATCH)

**2. Editar 4 arquivos**:
- `package.json`: `"version": "2.1.1"`
- `android/app/build.gradle`: `versionCode 3`, `versionName "2.1.1"`
- `public/version.json`: versão 2.1.1, versionCode 3
- `api/index.js`: versão 2.1.1, versionCode 3

**3. Changelog**:
```json
"changelog": [
  "🐛 Corrigido bug crítico no WiFi Scanner",
  "✅ Melhorias de estabilidade"
]
```

**4. Atualização obrigatória?**
- Se bug crítico: `"forceUpdate": true`
- Se bug menor: `"forceUpdate": false`

**5. Commitar e enviar**:
```powershell
git add .
git commit -m "fix: corrige bug crítico no WiFi Scanner (v2.1.1)"
git push origin main
```

**6. Aguardar GitHub Actions** (~5-10 min)

**7. Baixar APK e testar**

**8. Criar release no GitHub** com APK testado

**9. Usuários verão notificação** na próxima vez que abrirem o app!

---

## ⚠️ IMPORTANTE

### Sempre Incremente versionCode

O `versionCode` é um número inteiro que SEMPRE aumenta:
- v2.1.0 → versionCode 2
- v2.1.1 → versionCode 3
- v2.2.0 → versionCode 4
- v3.0.0 → versionCode 5

**Nunca repita ou diminua o versionCode!**

### Teste Antes de Criar Release

1. ✅ Testar localmente no Android Studio
2. ✅ Baixar APK do GitHub Actions
3. ✅ Testar APK no celular
4. ✅ Só então criar release

### URL do APK

A URL só existe DEPOIS de criar o release:
```
https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.2.0/TarifaZero.apk
```

Se a URL estiver errada, usuários não conseguirão baixar!

---

## 🎯 Resumo Rápido

```powershell
# 1. Atualizar versão (4 arquivos)
# 2. Commitar
git add .
git commit -m "chore: bump version to 2.2.0"
git push origin main

# 3. Aguardar GitHub Actions
# 4. Baixar e testar APK
# 5. Criar release no GitHub com APK
# 6. Usuários verão notificação automaticamente!
```

---

**Última Atualização**: 31/03/2026  
**Versão Atual**: 2.1.0 (versionCode: 2)
