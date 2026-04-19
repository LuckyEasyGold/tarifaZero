# Como Contribuir com o Tarifa Zero

## Configuração do Ambiente

### Pré-requisitos

- Node.js 24+
- Conta no [Neon](https://neon.tech) (PostgreSQL gratuito)
- Conta no [Vercel](https://vercel.com) (opcional, para deploy)

### 1. Clone e instale

```bash
git clone https://github.com/LuckyEasyGold/tarifaZero.git
cd tarifaZero
npm install --legacy-peer-deps
```

### 2. Configure o banco

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

Habilite PostGIS no Neon (SQL Editor):

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Crie as tabelas e popule com dados iniciais:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Rode localmente

```bash
npm run dev
```

Acesse: http://localhost:5173

A API roda junto via Vite proxy. Para testar endpoints diretamente, use `vercel dev` (requer Vercel CLI).

## Fluxo de Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas alterações
4. Commit: `git commit -m "feat: descrição da mudança"`
5. Push: `git push origin feature/minha-feature`
6. Abra um Pull Request

## Padrões de Código

- TypeScript estrito — sem `any` desnecessário
- Componentes React funcionais com hooks
- Nomes em português para variáveis de domínio (linhas, paradas, trajetos)
- Nomes em inglês para infraestrutura (hooks, services, utils)

## Comandos Úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run db:studio    # Interface visual do banco (Prisma Studio)
npm run db:push      # Aplicar mudanças no schema sem migration
npm run db:migrate   # Criar migration formal
```

## Build do APK Android

Requer Android Studio e Java 17.

```bash
npm run build
npx cap sync android
npx cap open android   # Abre no Android Studio
```

O GitHub Actions gera o APK automaticamente a cada push na `main`. Acesse em: https://github.com/LuckyEasyGold/tarifaZero/actions

## Adicionar Apoiadores (Doações via Pix)

Acesse o banco via [Neon SQL Editor](https://console.neon.tech) e execute:

```sql
INSERT INTO supporters (id, name, "socialUrl", "socialLabel", active, "createdAt")
VALUES (gen_random_uuid(), 'Nome', 'https://instagram.com/usuario', 'Instagram', true, NOW());
```

## Liberar Nova Versão

Atualize a versão em 4 lugares:

1. `package.json` → `"version"`
2. `android/app/build.gradle` → `versionCode` (incrementar +1) e `versionName`
3. `public/version.json` → `version`, `versionCode`, `releaseDate`, `changelog`
4. `api/index.js` → endpoint `/version`

Depois:

```bash
git add .
git commit -m "chore: bump version to X.Y.Z"
git push origin main
```

O GitHub Actions gera o APK automaticamente. Após o build, crie um Release no GitHub e anexe o APK.
