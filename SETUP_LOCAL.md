# 🔧 Setup Ambiente Local

## Problema Atual

Quando você roda `npm run dev` localmente:
- ❌ Mapa abre em São Paulo (coordenadas padrão)
- ❌ Linhas não carregam
- ❌ Parece que banco está vazio

**Causa:** O arquivo `.env` local não tem a `DATABASE_URL` do Neon.

## Solução: Configurar DATABASE_URL Local

### Opção 1: Copiar do Vercel (Recomendado)

1. Acesse: https://vercel.com/luckyeasygolds-projects/tarifazero/settings/environment-variables

2. Copie o valor de `DATABASE_URL`

3. Cole no arquivo `.env` local:
```env
DATABASE_URL="postgresql://[usuario]:[senha]@[host]/[database]?sslmode=require"
```

4. Reinicie o servidor:
```bash
# Parar servidor (Ctrl+C)
npm run dev
```

### Opção 2: Usar Vercel CLI

```bash
# Baixar variáveis de ambiente do Vercel
vercel env pull .env.local

# Renomear para .env
mv .env.local .env

# Rodar dev
npm run dev
```

### Opção 3: Criar .env Manualmente

Se não quiser expor credenciais, crie um banco local:

```env
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tarifazero?schema=public"
```

Depois rode:
```bash
# Criar tabelas
npm run db:push

# Popular dados
npm run db:seed
```

## Configurar APK para Produção

O APK buildado localmente também precisa apontar para a API de produção.

### Editar capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.newsdrop.tarifazero',
  appName: 'Tarifa Zero',
  webDir: 'dist',
  server: {
    // IMPORTANTE: Apontar para API de produção
    url: 'https://project-btoew.vercel.app',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

### Rebuild do APK

```bash
# Build web
npm run build

# Sync com Android
npx cap sync android

# Build APK
cd android
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
.\gradlew assembleDebug --no-daemon
```

## Verificar Conexão com Banco

### Teste 1: Prisma Studio

```bash
npm run db:studio
```

Deve abrir interface web mostrando as tabelas e dados.

### Teste 2: API Health Check

```bash
# Local (deve falhar se não tiver DATABASE_URL)
curl http://localhost:5173/api/health

# Produção (deve funcionar)
curl https://project-btoew.vercel.app/api/health
```

### Teste 3: Listar Linhas

```bash
# Local
curl http://localhost:5173/api/lines

# Produção
curl https://project-btoew.vercel.app/api/lines
```

## Estrutura de Arquivos .env

```
.env                 # Local - NÃO commitar (no .gitignore)
.env.example         # Template sem valores sensíveis
.env.local           # Alternativa ao .env
```

### .env.example (já existe)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### .env (criar)
```env
# Copiar do Vercel
DATABASE_URL="postgresql://[VALOR_REAL_DO_VERCEL]"
```

## Troubleshooting

### Erro: "Can't reach database server"
- Verificar se DATABASE_URL está no .env
- Verificar se URL está correta (copiar do Vercel)
- Verificar conexão com internet

### Erro: "Prisma Client not generated"
```bash
npm run db:generate
```

### Mapa abre em São Paulo
- Significa que não há dados de linhas
- Verificar se API retorna dados: http://localhost:5173/api/lines
- Se retornar vazio, problema é DATABASE_URL

### APK não carrega dados
- Verificar `capacitor.config.ts` tem `server.url`
- Rebuild: `npm run android:sync`
- Reinstalar APK no celular

## Resumo Rápido

Para desenvolvimento local funcionar:

1. ✅ Copiar DATABASE_URL do Vercel para `.env`
2. ✅ Rodar `npm run dev`
3. ✅ Testar http://localhost:5173/

Para APK funcionar:

1. ✅ Configurar `server.url` no `capacitor.config.ts`
2. ✅ Rodar `npm run android:build`
3. ✅ Instalar APK no celular

## Notas Importantes

- ⚠️ Nunca commitar `.env` com credenciais reais
- ⚠️ `.env` está no `.gitignore` por segurança
- ✅ Produção (Vercel) sempre funciona (tem DATABASE_URL configurado)
- ✅ Localhost só funciona se configurar `.env` local

---

**Última atualização:** 29/03/2026  
**Status:** Documentado para próxima sessão
