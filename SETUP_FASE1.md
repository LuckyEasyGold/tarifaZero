# 🚀 Setup - FASE 1: Infraestrutura Base

## ✅ O que foi criado

### Estrutura de Arquivos
```
api/
├── lib/
│   ├── db.ts           ✅ Conexão Prisma + helpers PostGIS
│   ├── response.ts     ✅ Utilitários de resposta HTTP
│   └── validation.ts   ✅ Validação com Zod
├── index.ts            ✅ Health check endpoint
├── package.json        ✅ Dependências do backend
└── tsconfig.json       ✅ Configuração TypeScript

prisma/
└── schema.prisma       ✅ Schema completo do banco

Raiz:
├── vercel.json         ✅ Configuração Vercel
├── .env.example        ✅ Template de variáveis
├── .gitignore          ✅ Atualizado
└── README_API.md       ✅ Documentação da API
```

### Dependências Adicionadas
- `@prisma/client` - ORM para PostgreSQL
- `@vercel/node` - Types para Vercel Functions
- `zod` - Validação de dados
- `prisma` - CLI do Prisma (dev)

---

## 📋 Próximos Passos (Execute na ordem)

### 1. Instalar Dependências

```bash
npm install
```

Isso vai instalar todas as dependências e gerar o Prisma Client automaticamente.

---

### 2. Criar Conta no Neon PostgreSQL

1. Acesse: https://neon.tech
2. Clique em "Sign Up" (pode usar GitHub)
3. Crie um novo projeto:
   - Nome: `tarifazero`
   - Região: escolha a mais próxima (ex: AWS São Paulo)
   - PostgreSQL version: 16 (mais recente)

---

### 3. Habilitar PostGIS

No dashboard do Neon:
1. Clique em "SQL Editor" no menu lateral
2. Execute este comando:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

3. Clique em "Run" ou pressione Ctrl+Enter
4. Você deve ver: "CREATE EXTENSION" como resposta

---

### 4. Copiar Connection String

1. No dashboard do Neon, clique em "Connection Details"
2. Copie a connection string (formato: `postgresql://user:password@host/database`)
3. Certifique-se de que está marcado "Pooled connection"

---

### 5. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua connection string:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

⚠️ **IMPORTANTE:** Não commite o arquivo `.env` no Git!

---

### 6. Criar Tabelas no Banco

```bash
npm run db:push
```

Isso vai:
- Conectar no Neon
- Criar todas as tabelas do schema
- Gerar o Prisma Client

Você deve ver algo como:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

---

### 7. Verificar Tabelas Criadas

Opção 1 - Prisma Studio (GUI):
```bash
npm run db:studio
```

Abre em: http://localhost:5555

Opção 2 - SQL Editor do Neon:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Você deve ver estas tabelas:
- lines
- routes
- route_points
- stops
- trips
- vehicle_positions
- user_tracks
- wifi_networks
- speed_stats

---

### 8. Testar API Localmente

Instale a Vercel CLI (se ainda não tiver):
```bash
npm install -g vercel
```

Execute o servidor de desenvolvimento:
```bash
vercel dev
```

Escolha as opções:
- Set up and develop: Yes
- Which scope: sua conta
- Link to existing project: No
- Project name: tarifazero
- Directory: ./
- Override settings: No

Acesse: http://localhost:3000/api

Você deve ver:
```json
{
  "success": true,
  "data": {
    "message": "Tarifa Zero API v1.0",
    "status": "healthy",
    "timestamp": "2026-03-28T...",
    "endpoints": { ... }
  }
}
```

---

## ✅ Checklist de Validação

Marque conforme completa:

- [ ] Dependências instaladas (`npm install`)
- [ ] Conta criada no Neon
- [ ] PostGIS habilitado no Neon
- [ ] Connection string copiada
- [ ] Arquivo `.env` configurado
- [ ] Tabelas criadas (`npm run db:push`)
- [ ] Prisma Studio abre corretamente
- [ ] Vercel CLI instalada
- [ ] API responde em http://localhost:3000/api

---

## 🐛 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se a variável `DATABASE_URL` está definida
- Reinicie o terminal

### Erro: "Can't reach database server"
- Verifique se a connection string está correta
- Verifique se tem `?sslmode=require` no final
- Teste a conexão no SQL Editor do Neon

### Erro: "PostGIS not found"
- Execute novamente o comando CREATE EXTENSION no Neon
- Aguarde alguns segundos e tente novamente

### Erro: "Prisma Client not generated"
```bash
npm run db:generate
```

### Vercel Dev não inicia
- Verifique se a porta 3000 está livre
- Tente: `vercel dev --listen 3001`

---

## 📊 Status da FASE 1

Após completar todos os passos, atualize o `PLANO_IMPLEMENTACAO.md`:

```markdown
### FASE 1: Infraestrutura Base
- [x] 1.1 - Criar conta/projeto no Neon PostgreSQL
- [x] 1.2 - Configurar PostGIS no Neon
- [x] 1.3 - Criar estrutura de pastas do backend
- [x] 1.4 - Configurar TypeScript para backend
- [x] 1.5 - Criar arquivo de variáveis de ambiente
- [x] 1.6 - Configurar Vercel CLI e deploy inicial

**Status:** ✅ Concluído
```

---

## 🎯 Próxima Fase

Após validar tudo, você estará pronto para a **FASE 2: Modelagem do Banco de Dados**, onde vamos:
- Popular as 5 linhas existentes
- Criar as rotas e paradas
- Importar os dados atuais do frontend

---

**Dúvidas?** Consulte o `README_API.md` para mais detalhes.
