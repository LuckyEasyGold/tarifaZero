# Como Obter Google Maps API Key

## 1. Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Crie um novo projeto ou selecione um existente

## 2. Habilitar APIs Necessárias

No menu lateral, vá em **APIs & Services** > **Library** e habilite:

- ✅ **Geocoding API** (para converter endereços em coordenadas)
- ✅ **Directions API** (para criar rotas)
- ✅ **Maps JavaScript API** (opcional, para visualização)

## 3. Criar Credenciais

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **API Key**
3. Copie a chave gerada

## 4. Configurar no Projeto

Adicione no arquivo `.env`:

```bash
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

## 5. Executar Importação

```bash
# Importar horários e geocodificar paradas
tsx scripts/import-horarios.ts
```

## Custos

Google Maps oferece **$200 de crédito gratuito por mês**, que é suficiente para:

- 40.000 requisições de Geocoding
- 40.000 requisições de Directions

Para este projeto (5 linhas com ~20 paradas cada), você usará aproximadamente:
- 100 requisições de Geocoding (paradas)
- 10 requisições de Directions (rotas)

**Total: ~110 requisições = GRÁTIS** ✅

## Alternativa: Importar Sem Geocodificação

Se não quiser usar Google Maps API agora, pode:

1. Executar o script sem a chave (usará coordenadas aproximadas)
2. Ajustar coordenadas manualmente depois no Prisma Studio

```bash
# Executar sem geocodificação
tsx scripts/import-horarios.ts
```

As paradas serão criadas, mas sem coordenadas precisas. Você pode adicionar depois.
