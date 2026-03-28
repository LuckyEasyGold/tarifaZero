# 🚀 Instruções de Deploy - Tarifa Zero

## ✅ Checklist Pré-Deploy

### 1. Conectar Vercel ao GitHub
- [ ] Acessar: https://vercel.com/luckyeasygolds-projects/tarifazero/settings/general
- [ ] Clicar em "Connect Git Repository"
- [ ] Selecionar GitHub
- [ ] Escolher repositório: `LuckyEasyGold/tarifaZero`
- [ ] Confirmar conexão

### 2. Configurar Variáveis de Ambiente
- [ ] Ir em Settings → Environment Variables
- [ ] Adicionar `DATABASE_URL`:
  ```
  postgresql://neondb_owner:npg_t1C9RyiYcGWK@ep-lucky-glade-acgf28fb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- [ ] Marcar: Production, Preview, Development
- [ ] Salvar

### 3. Fazer Commit e Push
```bash
git add .
git commit -m "feat: adicionar backend API com Neon PostgreSQL"
git push origin main
```

### 4. Aguardar Deploy
- O Vercel vai detectar o push
- Vai fazer build automático
- Deploy em ~2-3 minutos

### 5. Verificar Deploy
Após o deploy, acesse:
- Frontend: https://tarifazero.vercel.app
- API Health: https://tarifazero.vercel.app/api
- API Health Detalhado: https://tarifazero.vercel.app/api/health

---

## 🔍 Verificar se está funcionando

### Teste 1: API Health Check
```bash
curl https://tarifazero.vercel.app/api
```

Deve retornar:
```json
{
  "success": true,
  "data": {
    "message": "Tarifa Zero API v1.0",
    "status": "healthy",
    ...
  }
}
```

### Teste 2: Banco de Dados
```bash
curl https://tarifazero.vercel.app/api/health
```

Deve retornar:
```json
{
  "success": true,
  "data": {
    "database": "connected",
    "postgis": "3.x.x",
    "tables": 9,
    ...
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "DATABASE_URL not found"
- Verifique se adicionou a variável no Vercel
- Faça um novo deploy: Settings → Deployments → Redeploy

### Erro: "Can't reach database"
- Verifique se a connection string está correta
- Teste localmente: `npm run db:studio`

### Erro: "Prisma Client not generated"
- O Vercel executa `npm run postinstall` automaticamente
- Isso gera o Prisma Client
- Se falhar, verifique os logs do build

### Build falha
- Verifique os logs no Vercel Dashboard
- Procure por erros de TypeScript ou dependências

---

## 📊 Após Deploy Bem-Sucedido

Você estará pronto para:
1. ✅ Popular o banco de dados (FASE 2)
2. ✅ Criar endpoints da API (FASE 3)
3. ✅ Integrar frontend com backend (FASE 9)

---

## 🔄 Fluxo de Desenvolvimento

### Desenvolvimento Local
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Banco de dados (visualizar)
npm run db:studio
```

### Deploy
```bash
git add .
git commit -m "sua mensagem"
git push origin main
# Vercel faz deploy automático!
```

---

**Próximo passo:** Popular banco de dados com as 5 linhas existentes (FASE 2)
