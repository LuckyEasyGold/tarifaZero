# Migração do Banco de Dados

## Mudanças Necessárias

### 1. Adicionar tabela `temp_stops`
```sql
CREATE TABLE temp_stops (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_temp_stops_line_id ON temp_stops(line_id);
```

### 2. Modificar tabela `wifi_networks`
```sql
-- Remover constraint antiga
ALTER TABLE wifi_networks DROP CONSTRAINT IF EXISTS wifi_networks_line_id_ssid_key;

-- Tornar SSID opcional
ALTER TABLE wifi_networks ALTER COLUMN ssid DROP NOT NULL;

-- Tornar BSSID obrigatório e único
ALTER TABLE wifi_networks ALTER COLUMN bssid SET NOT NULL;
ALTER TABLE wifi_networks ADD CONSTRAINT wifi_networks_bssid_key UNIQUE (bssid);

-- Adicionar índice em line_id
CREATE INDEX IF NOT EXISTS idx_wifi_networks_line_id ON wifi_networks(line_id);
```

## Como Aplicar

### Opção 1: Via Prisma (Recomendado)
```bash
npx prisma migrate dev --name add_temp_stops_and_fix_wifi
npx prisma generate
```

### Opção 2: Manualmente no Neon
1. Acesse o console do Neon
2. Execute os comandos SQL acima
3. Execute `npx prisma generate` localmente

## Verificar Migração
```bash
npx prisma db pull
npx prisma generate
```
