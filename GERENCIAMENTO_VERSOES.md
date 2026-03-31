# Gerenciamento de Versões - Tarifa Zero

**Data**: 30/03/2026  
**Versão Atual**: 2.1.0

---

## 📋 Sistema de Versionamento

O Tarifa Zero usa **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH
  2  .  1  .  0
```

- **MAJOR** (2): Mudanças incompatíveis com versões anteriores
- **MINOR** (1): Novas funcionalidades compatíveis
- **PATCH** (0): Correções de bugs

---

## 🎯 Quando Liberar Nova Versão

### ❌ NÃO libere versão quando:
- Está apenas testando
- Fez pequenas mudanças de texto
- Ainda não testou o APK
- Build do GitHub Actions falhou
- Há bugs conhecidos

### ✅ LIBERE versão quando:
- Testou o APK completamente
- Todas as funcionalidades funcionam
- Não há bugs críticos
- Fez mudanças significativas
- Quer que usuários atualizem

---

## 🔢 Tipos de Versão

### PATCH (2.1.0 → 2.1.1)
**Quando usar**: Correções de bugs pequenos

**Exemplos**:
- Corrigir texto errado
- Corrigir cor de botão
- Corrigir link quebrado
- Pequenas melhorias de UX

**Como fazer**:
```bash
# 1. Atualizar versões
# package.json: "version": "2.1.1"
# build.gradle: versionCode 3, versionName "2.1.1"
# public/version.json: "version": "2.1.1", "versionCode": 3
# api/index.js: version: "2.1.1", versionCode: 3

# 2. Commit
git add .
git commit -m "chore: bump version to 2.1.1"
git push

# 3. Aguardar build do GitHub Actions
# 4. Testar APK
# 5. Criar release (veja abaixo)
```

### MINOR (2.1.0 → 2.2.0)
**Quando usar**: Novas funcionalidades

**Exemplos**:
- Nova página no app
- Novo recurso de busca
- Integração com nova API
- Melhorias significativas

**Como fazer**:
```bash
# Mesmo processo, mas muda MINOR
# package.json: "version": "2.2.0"
# build.gradle: versionCode 4, versionName "2.2.0"
# etc.
```

### MAJOR (2.1.0 → 3.0.0)
**Quando usar**: Mudanças grandes e incompatíveis

**Exemplos**:
- Redesign completo
- Mudança de banco de dados
- Remoção de funcionalidades antigas
- Requer reinstalação

**Como fazer**:
```bash
# Mesmo processo, mas muda MAJOR
# package.json: "version": "3.0.0"
# build.gradle: versionCode 5, versionName "3.0.0"
# etc.
```

---

## 📝 Processo Completo de Release

### Passo 1: Preparar Versão

1. **Decidir o número da versão**
   - Bug fix? → PATCH (2.1.1)
   - Nova feature? → MINOR (2.2.0)
   - Breaking change? → MAJOR (3.0.0)

2. **Atualizar arquivos** (4 lugares):

   **a) package.json**
   ```json
   {
     "version": "2.2.0"
   }
   ```

   **b) android/app/build.gradle**
   ```groovy
   versionCode 4  // Sempre incrementa +1
   versionName "2.2.0"
   ```

   **c) public/version.json**
   ```json
   {
     "version": "2.2.0",
     "versionCode": 4,
     "releaseDate": "2026-04-01",
     "downloadUrl": "https://github.com/LuckyEasyGold/tarifaZero/releases/download/v2.2.0/TarifaZero.apk",
     "changelog": [
       "✅ Nova funcionalidade X",
       "✅ Melhoria Y",
       "🐛 Correção de bug Z"
     ],
     "minVersion": "2.0.0",
     "forceUpdate": false
   }
   ```

   **d) api/index.js** (endpoint /version)
   ```javascript
   version: "2.2.0",
   versionCode: 4,
   releaseDate: "2026-04-01",
   // ... resto igual ao version.json
   ```

3. **Atualizar changelog**
   - Liste as mudanças principais
   - Use emojis: ✅ (novo), 🐛 (bug fix), ⚡ (melhoria)
   - Seja claro e objetivo

### Passo 2: Commit e Push

```bash
git add package.json android/app/build.gradle public/version.json api/index.js
git commit -m "chore: bump version to 2.2.0

✅ Nova funcionalidade X
✅ Melhoria Y
🐛 Correção de bug Z"
git push origin main
```

### Passo 3: Aguardar Build

1. Vá para: https://github.com/LuckyEasyGold/tarifaZero/actions
2. Aguarde o build completar (~5-10 min)
3. Baixe o APK dos Artifacts

### Passo 4: Testar APK

1. Instale o APK no seu celular
2. Teste TODAS as funcionalidades
3. Verifique se não há crashes
4. Teste em diferentes cenários

**Se encontrar bugs**: 
- NÃO crie release ainda
- Corrija os bugs
- Volte ao Passo 1

### Passo 5: Criar GitHub Release

Quando o APK estiver 100% testado e funcionando:

1. **Via GitHub Web**:
   - Vá para: https://github.com/LuckyEasyGold/tarifaZero/releases
   - Clique em "Draft a new release"
   - Tag: `v2.2.0`
   - Title: `Tarifa Zero v2.2.0`
   - Description:
     ```markdown
     ## 🎉 Novidades

     ✅ Nova funcionalidade X
     ✅ Melhoria Y
     🐛 Correção de bug Z

     ## 📱 Instalação

     1. Baixe o arquivo `TarifaZero.apk`
     2. Instale no seu Android
     3. Aproveite!

     ## 📊 Detalhes Técnicos

     - Versão: 2.2.0
     - Version Code: 4
     - Data: 01/04/2026
     - Tamanho: ~10 MB
     ```
   - Anexe o APK testado
   - Marque como "Latest release"
   - Clique em "Publish release"

2. **Via GitHub CLI** (alternativo):
   ```bash
   gh release create v2.2.0 \
     --title "Tarifa Zero v2.2.0" \
     --notes "✅ Nova funcionalidade X..." \
     TarifaZero.apk
   ```

### Passo 6: Notificar Usuários

Após criar o release:

1. **Automático**: Usuários com app instalado verão notificação na próxima vez que abrirem
2. **Manual**: Poste nas redes sociais, grupos, etc.

---

## 🔔 Sistema de Notificação

### Como Funciona

1. **App verifica versão** ao abrir
2. **Compara versionCode** local vs servidor
3. **Mostra banner** se houver atualização
4. **Usuário clica** "Baixar Atualização"
5. **Abre GitHub Release** para download

### Tipos de Atualização

**Opcional** (`forceUpdate: false`):
- Banner azul no topo
- Usuário pode dispensar
- Aparece novamente na próxima sessão

**Obrigatória** (`forceUpdate: true`):
- Banner amarelo com ⚠️
- Usuário NÃO pode dispensar
- Deve atualizar para continuar

### Quando Forçar Atualização

Use `forceUpdate: true` apenas quando:
- Há bug crítico de segurança
- API mudou e versão antiga não funciona
- Banco de dados mudou
- App antigo vai crashar

**Exemplo**:
```json
{
  "version": "2.2.0",
  "forceUpdate": true,  // ⚠️ Obrigatória
  "minVersion": "2.2.0"  // Versão mínima aceita
}
```

---

## 📊 Histórico de Versões

### v2.1.0 (30/03/2026) - Atual
- ✅ Suporte Android 13+
- ✅ Sistema de contribuidores
- ✅ Melhorias WiFi Scanner
- ✅ Página Sobre
- ✅ Sistema de versionamento

### v2.0.0 (Anterior)
- ✅ Modo gravação de rotas
- ✅ Marcação de paradas
- ✅ Gamificação e ranking

### v1.0.0 (Inicial)
- ✅ Visualização de linhas
- ✅ Mapa em tempo real
- ✅ Busca de rotas

---

## 🛠️ Ferramentas Úteis

### Verificar Versão Instalada

No app, vá em: **Sobre** → Veja no rodapé

### Verificar Última Versão Disponível

```bash
curl https://tarifazero.vercel.app/api/version
```

### Comparar Versões

```bash
# Local (instalada)
adb shell dumpsys package com.newsdrop.tarifazero | grep versionName

# Remota (disponível)
curl https://tarifazero.vercel.app/api/version | jq .data.version
```

---

## ✅ Checklist de Release

Antes de criar release, verifique:

- [ ] Versão atualizada em 4 lugares (package.json, build.gradle, version.json, api/index.js)
- [ ] versionCode incrementado
- [ ] Changelog atualizado
- [ ] Commit e push feitos
- [ ] Build do GitHub Actions passou
- [ ] APK baixado e testado
- [ ] Todas as funcionalidades funcionam
- [ ] Não há bugs críticos
- [ ] Testado em dispositivo real
- [ ] Release criado no GitHub
- [ ] APK anexado ao release
- [ ] URL do downloadUrl atualizada

---

## 🆘 Problemas Comuns

### "Usuários não veem notificação de atualização"

**Causas**:
1. version.json não foi atualizado
2. API /version não retorna versão correta
3. versionCode não foi incrementado
4. Usuário está no browser (não no app)

**Solução**:
```bash
# Verificar API
curl https://tarifazero.vercel.app/api/version

# Deve retornar versionCode maior que o instalado
```

### "Notificação aparece mas download não funciona"

**Causa**: URL do downloadUrl está errada

**Solução**:
1. Verifique se release foi criado
2. Verifique se APK foi anexado
3. Atualize downloadUrl com URL correta

### "Quero reverter versão"

**NÃO recomendado**, mas se necessário:

1. Crie nova versão com correção (ex: 2.2.1)
2. Marque como forceUpdate: true
3. Usuários serão forçados a atualizar

---

## 💡 Dicas

1. **Teste SEMPRE antes de criar release**
2. **Não apresse releases** - qualidade > velocidade
3. **Mantenha changelog claro** - usuários leem
4. **Use versionCode sequencial** - nunca pule números
5. **Documente mudanças** - ajuda no futuro
6. **Comunique releases** - avise usuários

---

**Última atualização**: 30/03/2026  
**Versão deste documento**: 1.0
