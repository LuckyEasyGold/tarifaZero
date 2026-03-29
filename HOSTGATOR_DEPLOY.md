# 🚀 Deploy no Hostgator - Tarifa Zero

## Problema Atual

O Vercel Hobby Plan tem limite de 12 Serverless Functions. O projeto atual tem mais de 12 endpoints separados, causando erro no deploy.

## Solução Implementada

### 1. API Consolidada ✅
Todos os endpoints foram consolidados em um único arquivo `api/index.js`, reduzindo de 15+ functions para apenas 1.

### 2. Deploy no Hostgator

Como alternativa ao Vercel, você pode hospedar o frontend no Hostgator.

## 📋 Passo a Passo

### 1. Build do Projeto

```bash
# Na raiz do projeto
npm run build
```

Isso gera a pasta `dist/` com todos os arquivos otimizados.

### 2. Preparar Arquivos para Upload

A pasta `dist/` contém:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── leaflet-vendor-[hash].js
│   └── react-vendor-[hash].js
├── splash.mp4
└── .htaccess (copiado automaticamente)
```

### 3. Configurar .htaccess

O arquivo `.htaccess` já está em `public/.htaccess` e será copiado automaticamente para `dist/` no build.

**IMPORTANTE:** Edite a linha `RewriteBase` no `.htaccess` conforme sua estrutura:

```apache
# Se estiver na raiz do domínio:
RewriteBase /

# Se estiver em subpasta:
RewriteBase /TarifaZero/tarifa_teste/
```

### 4. Upload via FTP

1. Conecte no FTP do Hostgator
2. Navegue até a pasta desejada:
   - Raiz: `public_html/`
   - Subpasta: `public_html/TarifaZero/tarifa_teste/`
3. Faça upload de TODOS os arquivos da pasta `dist/`
4. Certifique-se que o `.htaccess` foi enviado

### 5. Configurar Variáveis de Ambiente

Como o Hostgator não suporta Serverless Functions, você tem duas opções:

#### Opção A: Usar API do Vercel (Recomendado)
Mantenha a API no Vercel e apenas o frontend no Hostgator.

No arquivo `src/services/trackingService.ts` e outros services, configure:

```typescript
const API_BASE = 'https://project-btoew.vercel.app/api';
```

#### Opção B: Backend Separado
Configure um backend Node.js separado (requer VPS ou servidor dedicado).

### 6. Testar

Acesse: `https://newsdrop.net.br/TarifaZero/tarifa_teste/`

Deve funcionar:
- ✅ Página carrega
- ✅ Splash screen aparece
- ✅ Navegação funciona
- ✅ Mapa carrega
- ✅ API responde (se usando Vercel)

## 🐛 Troubleshooting

### Erro: "Failed to load module script"

**Causa:** Servidor não está servindo arquivos .js com MIME type correto.

**Solução:**
1. Verifique se `.htaccess` foi enviado
2. Adicione estas linhas no `.htaccess`:
```apache
AddType application/javascript .js
AddType text/css .css
AddType video/mp4 .mp4
```

### Erro: Página em branco

**Causa:** Base path incorreto.

**Solução:**
1. Verifique `RewriteBase` no `.htaccess`
2. Se estiver em subpasta, deve ser: `RewriteBase /TarifaZero/tarifa_teste/`

### Erro: Rotas não funcionam (404)

**Causa:** Rewrite rules não estão ativas.

**Solução:**
1. Verifique se `mod_rewrite` está habilitado no servidor
2. Entre em contato com suporte do Hostgator para habilitar

### API não responde

**Causa:** CORS ou URL da API incorreta.

**Solução:**
1. Verifique se a URL da API está correta nos services
2. Verifique se CORS está habilitado no Vercel
3. Teste a API diretamente: `https://project-btoew.vercel.app/api`

## 📊 Comparação: Vercel vs Hostgator

| Recurso | Vercel (Hobby) | Hostgator |
|---------|----------------|-----------|
| Serverless Functions | ❌ Limite de 12 | ❌ Não suporta |
| Frontend Estático | ✅ Ilimitado | ✅ Ilimitado |
| Deploy Automático | ✅ Git push | ❌ Manual (FTP) |
| HTTPS | ✅ Grátis | ✅ Grátis |
| Custom Domain | ✅ Grátis | ✅ Incluído |
| Build Automático | ✅ Sim | ❌ Local |

## 🎯 Recomendação

### Solução Híbrida (Melhor)
- **Frontend:** Hostgator (sem limite de functions)
- **Backend API:** Vercel (1 function consolidada)
- **Banco de Dados:** Neon PostgreSQL

### Vantagens:
- ✅ Sem limite de functions (API consolidada)
- ✅ Frontend rápido no Hostgator
- ✅ API serverless no Vercel
- ✅ Banco gerenciado no Neon
- ✅ Custo zero

## 🔄 Atualizar Deploy

Sempre que fizer mudanças:

```bash
# 1. Build
npm run build

# 2. Upload via FTP
# Envie apenas os arquivos modificados da pasta dist/

# 3. Limpar cache do navegador
# Ctrl + F5
```

## 📝 Checklist de Deploy

- [ ] Build executado (`npm run build`)
- [ ] `.htaccess` configurado com `RewriteBase` correto
- [ ] Todos os arquivos de `dist/` enviados via FTP
- [ ] `.htaccess` enviado e visível no servidor
- [ ] URL da API configurada nos services
- [ ] Testado em navegador
- [ ] Cache limpo (Ctrl + F5)
- [ ] Rotas testadas (navegação entre páginas)
- [ ] API testada (linhas carregam)

---

**Dúvidas?** Consulte a documentação do Hostgator ou entre em contato com o suporte.
