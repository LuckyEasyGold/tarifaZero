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

### 5. Baixar e Testar APK do GitHub Actions

**IMPORTANTE**: O GitHub Actions cria um ZIP. Você precisa extrair para testar.

1. No workflow concluído, clicar em "Artifacts"
2. Baixar "TarifaZero.apk" (será baixado como ZIP)
3. **Extrair o ZIP** → Dentro tem o `TarifaZero.apk`
4. Instalar `TarifaZero.apk` no celular
5. **TESTAR TUDO NOVAMENTE**

**Verificar**:
- [ ] App instala sem erros
- [ ] Todas as funcionalidades funcionam
- [ ] WiFi Scanner funciona
- [ ] GPS funciona
- [ ] Sem crashes

**Nota**: O ZIP é apenas para você testar. Os usuários vão baixar o APK direto do GitHub Release (passo 6).

---

### 6. Criar Release no GitHub

**IMPORTANTE**: Só criar release DEPOIS de testar o APK do Actions!

O GitHub Release é onde os **usuários finais** vão baixar o APK (sem ZIP).

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
4. **Anexar o APK testado** (arrastar o arquivo `TarifaZero.apk` extraído do ZIP)
5. Clicar em "Publish release"

**Resultado**: Usuários vão baixar o APK DIRETO (sem ZIP) do link:
```
https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.2.0/TarifaZero.apk
```

---

### 7. Atualizar URL no version.json

**IMPORTANTE**: Agora o APK fica hospedado no Vercel (pasta public)!

A URL do APK é:
```
https://tarifazero.vercel.app/TarifaZero.apk
```

**Verificar se a URL está correta** em:
- `public/version.json` → `"downloadUrl": "https://tarifazero.vercel.app/TarifaZero.apk"`
- `api/index.js` (endpoint /version) → `downloadUrl: "https://tarifazero.vercel.app/TarifaZero.apk"`

### 8. Commitar APK para o Repositório

```powershell
git add public/TarifaZero.apk
git commit -m "chore: atualiza APK v2.2.0"
git push origin main
```

O Vercel vai fazer deploy automaticamente e o APK estará disponível em:
```
https://tarifazero.vercel.app/TarifaZero.apk
```

**Vantagens**:
- ✅ Link permanente e estável
- ✅ Sem necessidade de criar GitHub Release
- ✅ Pode compartilhar o link diretamente
- ✅ Vercel serve o arquivo automaticamente

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

### GitHub Actions vs GitHub Release

**GitHub Actions** (Artifacts):
- ✅ Gera APK automaticamente
- ❌ Cria um ZIP (você precisa extrair)
- 🎯 Use para: TESTAR antes de liberar
- ⏰ Expira em 30 dias

**GitHub Release**:
- ✅ APK direto (sem ZIP)
- ✅ Link permanente
- 🎯 Use para: USUÁRIOS FINAIS baixarem
- ⏰ Nunca expira

**Fluxo correto**:
1. GitHub Actions gera APK (em ZIP)
2. Você baixa, extrai e testa
3. Se OK, cria Release e anexa o APK (sem ZIP)
4. Usuários baixam do Release (APK direto)

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
