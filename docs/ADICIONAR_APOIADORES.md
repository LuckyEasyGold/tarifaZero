# Como Adicionar Contribuidores

Este documento explica como adicionar novos contribuidores que fizeram doações via Pix ao projeto Tarifa Zero.

---

## 📋 Informações Necessárias

Para cada contribuidor, você precisa de:

1. **Nome** (obrigatório)
2. **Link da rede social** (opcional) - Instagram, Facebook, etc.
3. **Label da rede social** (opcional) - "Instagram", "Facebook", etc.

---

## 🎯 Método 1: Direto no Neon (RECOMENDADO)

### Passo 1: Acessar o Neon

1. Acesse: https://console.neon.tech/
2. Faça login
3. Selecione o projeto "tarifaZero"
4. Vá em "SQL Editor"

### Passo 2: Executar SQL

Cole e execute o seguinte SQL (ajuste os dados):

```sql
-- Adicionar um novo contribuidor
INSERT INTO supporters (id, name, "socialUrl", "socialLabel", active, "createdAt")
VALUES (
  gen_random_uuid(),  -- Gera ID único automaticamente
  'Nome do Contribuidor',
  'https://www.instagram.com/usuario',  -- ou NULL se não tiver
  'Instagram',  -- ou NULL se não tiver
  true,
  NOW()
);
```

### Exemplos:

**Com Instagram:**
```sql
INSERT INTO supporters (id, name, "socialUrl", "socialLabel", active, "createdAt")
VALUES (
  gen_random_uuid(),
  'João Silva',
  'https://www.instagram.com/joaosilva',
  'Instagram',
  true,
  NOW()
);
```

**Com Facebook:**
```sql
INSERT INTO supporters (id, name, "socialUrl", "socialLabel", active, "createdAt")
VALUES (
  gen_random_uuid(),
  'Maria Santos',
  'https://www.facebook.com/mariasantos',
  'Facebook',
  true,
  NOW()
);
```

**Sem rede social:**
```sql
INSERT INTO supporters (id, name, "socialUrl", "socialLabel", active, "createdAt")
VALUES (
  gen_random_uuid(),
  'Pedro Costa',
  NULL,
  NULL,
  true,
  NOW()
);
```

### Passo 3: Verificar

```sql
-- Ver todos os contribuidores
SELECT * FROM supporters ORDER BY "createdAt" DESC;
```

---

## 🔧 Método 2: Via Script (Alternativo)

Se preferir usar um script local:

### Passo 1: Editar o script

Edite o arquivo `scripts/seed-supporters.js` e adicione o novo contribuidor no array:

```javascript
const supporters = [
  // ... contribuidores existentes ...
  {
    name: 'Novo Contribuidor',
    socialUrl: 'https://www.instagram.com/usuario',
    socialLabel: 'Instagram',
    active: true
  }
];
```

### Passo 2: Executar

```bash
node scripts/seed-supporters.js
```

---

## 📊 Estrutura da Tabela

```sql
CREATE TABLE supporters (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  socialUrl    TEXT,
  socialLabel  TEXT,
  avatarUrl    TEXT,
  active       BOOLEAN DEFAULT true,
  createdAt    TIMESTAMP DEFAULT NOW()
);
```

### Campos:

- **id**: ID único (gerado automaticamente)
- **name**: Nome do contribuidor (obrigatório)
- **socialUrl**: Link da rede social (opcional)
- **socialLabel**: Nome da rede social (opcional) - "Instagram", "Facebook", etc.
- **avatarUrl**: URL da foto de perfil (opcional, não usado atualmente)
- **active**: Se está ativo (true/false)
- **createdAt**: Data de criação

---

## 🎨 Como Aparece no App

Os contribuidores aparecem na página "Sobre" em um card chamado "Quem já contribuiu 💛":

**Com link:**
```
🔗 Marcos Dieison (clicável, abre Instagram)
```

**Sem link:**
```
Din0 (não clicável)
```

---

## 🔄 Atualizar Contribuidor Existente

```sql
-- Atualizar link social
UPDATE supporters
SET "socialUrl" = 'https://www.instagram.com/novousuario',
    "socialLabel" = 'Instagram'
WHERE name = 'Nome do Contribuidor';

-- Remover link social
UPDATE supporters
SET "socialUrl" = NULL,
    "socialLabel" = NULL
WHERE name = 'Nome do Contribuidor';

-- Desativar contribuidor (não aparece mais no app)
UPDATE supporters
SET active = false
WHERE name = 'Nome do Contribuidor';
```

---

## 🗑️ Remover Contribuidor

```sql
-- Desativar (recomendado - mantém histórico)
UPDATE supporters
SET active = false
WHERE name = 'Nome do Contribuidor';

-- Deletar permanentemente (não recomendado)
DELETE FROM supporters
WHERE name = 'Nome do Contribuidor';
```

---

## ✅ Verificações

Após adicionar um contribuidor:

1. **Verificar no banco:**
   ```sql
   SELECT * FROM supporters WHERE name = 'Nome do Contribuidor';
   ```

2. **Verificar na API:**
   ```bash
   curl https://seu-dominio.vercel.app/api/supporters
   ```

3. **Verificar no app:**
   - Abrir o app
   - Ir em "Sobre"
   - Rolar até "Quem já contribuiu 💛"
   - Verificar se o nome aparece

---

## 📝 Contribuidores Atuais

Atualmente temos 4 contribuidores cadastrados:

1. **Marcos Dieison** - [@marcdieison](https://www.instagram.com/marcdieison)
2. **Din0** - sem link
3. **Leticia** - [@leti_bzt](https://www.instagram.com/leti_bzt)
4. **Claudio** - [@claudiomarturra](https://www.instagram.com/claudiomarturra)

---

## 🆘 Problemas Comuns

### "Contribuidor não aparece no app"

1. Verificar se `active = true`
2. Verificar se o app está buscando da API correta
3. Limpar cache do navegador/app
4. Verificar se a API `/api/supporters` está retornando os dados

### "Erro ao inserir"

1. Verificar se o nome não está duplicado
2. Verificar se a sintaxe SQL está correta
3. Verificar se está conectado ao banco correto

### "Link não abre"

1. Verificar se a URL está completa (com https://)
2. Verificar se não tem espaços na URL
3. Verificar se o `socialLabel` está preenchido

---

## 💡 Dicas

1. **Sempre use `gen_random_uuid()`** para gerar IDs únicos
2. **Mantenha os nomes curtos** - ficam melhores no layout
3. **Prefira Instagram** - é a rede social mais usada
4. **Teste no app** após adicionar
5. **Faça backup** antes de deletar

---

## 📞 Suporte

Se tiver dúvidas:

1. Consulte este documento
2. Verifique os logs da API
3. Teste no SQL Editor do Neon
4. Verifique a estrutura da tabela

---

**Última atualização**: 30/03/2026
