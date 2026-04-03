# Como Atualizar Coordenadas das Paradas

## Status Atual

As paradas foram criadas com **coordenadas aproximadas** de Palmas/PR porque a Google Maps API ainda não estava ativa quando importamos os horários.

## Quando a API Estiver Ativa

### 1. Testar a API

```bash
npx tsx scripts/test-google-api.ts
```

Se aparecer "✅ Geocoding API funcionando!", pode prosseguir.

### 2. Atualizar Coordenadas

```bash
npx tsx scripts/update-coordinates.ts
```

Este script vai:
- Buscar todas as 12 paradas no banco
- Geocodificar cada uma usando Google Maps
- Atualizar as coordenadas no banco de dados
- Mostrar progresso em tempo real

### 3. Verificar Resultados

```bash
npx prisma studio
```

Abra a tabela `stops` e verifique se as coordenadas foram atualizadas.

## Tempo de Ativação da API

Geralmente leva de **5 a 15 minutos** após habilitar a API no Google Cloud Console.

## Alternativa: Coordenadas Manuais

Se preferir, você pode adicionar coordenadas manualmente no Prisma Studio:

1. Abra: `npx prisma studio`
2. Vá em `stops`
3. Clique em cada parada
4. Edite `lat` e `lng`
5. Salve

### Coordenadas de Referência (Palmas/PR)

- **Centro de Palmas**: -26.4844, -49.0761
- **Rodoviária**: -26.4850, -49.0770
- **IFPR**: -26.4900, -49.0650

Use o Google Maps para encontrar coordenadas exatas:
1. Abra: https://www.google.com/maps
2. Procure o local
3. Clique com botão direito no mapa
4. Copie as coordenadas

## Após Atualizar

Não precisa gerar novo APK! As coordenadas são carregadas do banco de dados em tempo real.

Basta:
1. Abrir o app
2. Ir em uma linha
3. Ver as paradas no mapa com coordenadas corretas

## Verificar se Funcionou

No app, vá em:
- **Linhas** → Escolha uma linha → **Ver no Mapa**

As paradas devem aparecer nos locais corretos de Palmas/PR.
