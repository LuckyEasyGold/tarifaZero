# Importar Horários e Rotas do PDF da Prefeitura

Este guia explica como importar dados de horários, rotas e paradas a partir do PDF oficial da prefeitura.

## 📋 Pré-requisitos

1. **Google Maps API Key** com as seguintes APIs habilitadas:
   - Geocoding API
   - Directions API
   - Places API (opcional)

2. **Configurar variável de ambiente**:
   ```bash
   # Adicionar no .env
   GOOGLE_MAPS_API_KEY=sua_chave_aqui
   ```

3. **Instalar dependências**:
   ```bash
   npm install pdf-parse
   ```

## 🚀 Como Usar

### 1. Extrair Dados do PDF

Primeiro, você precisa extrair manualmente os dados do PDF e organizá-los no formato JSON:

```typescript
const dadosLinha = {
  lineCode: 'L001',
  lineName: 'Linha 001 - Eldorado / IFPR',
  stops: [
    {
      name: 'Terminal Rodoviário',
      address: 'Rua Marechal Deodoro, 1234, Palmas, PR',
      times: ['06:00', '07:00', '08:00', '12:00', '18:00', '22:00']
    },
    {
      name: 'Praça Central',
      address: 'Praça Getúlio Vargas, Palmas, PR',
      times: ['06:15', '07:15', '08:15', '12:15', '18:15', '22:15']
    }
  ],
  route: {
    origin: 'Terminal Rodoviário',
    destination: 'IFPR',
    streets: [
      'Rua Marechal Deodoro',
      'Avenida Presidente Kennedy',
      'Rua Amazonas'
    ]
  }
};
```

### 2. Executar Importação

```bash
tsx scripts/import-schedules.ts
```

### 3. Aplicar Migração do Banco

```bash
npx prisma migrate dev --name add-scheduled-times
npx prisma generate
```

## 📊 Estrutura de Dados

### Horários Programados

A tabela `ScheduledTime` armazena:
- `lineId`: ID da linha
- `stopId`: ID da parada
- `time`: Horário no formato HH:MM
- `dayOfWeek`: Tipo de dia ('weekday', 'saturday', 'sunday', 'holiday')
- `direction`: Direção ('ida' ou 'volta')

### Exemplo de Consulta

```typescript
// Buscar horários de uma parada
const horarios = await prisma.scheduledTime.findMany({
  where: {
    stopId: 'parada-id',
    dayOfWeek: 'weekday',
    active: true
  },
  orderBy: {
    time: 'asc'
  }
});
```

## 🎯 Calcular Posição do Ônibus Baseado em Horários

Com os horários programados, podemos estimar onde o ônibus deveria estar:

```typescript
function estimarPosicaoOnibus(
  horarios: ScheduledTime[],
  rota: RoutePoint[],
  horaAtual: Date
): { lat: number; lng: number } {
  // 1. Encontrar último horário passado e próximo horário
  const horaAtualStr = horaAtual.toTimeString().slice(0, 5);
  
  const ultimoHorario = horarios
    .filter(h => h.time <= horaAtualStr)
    .sort((a, b) => b.time.localeCompare(a.time))[0];
  
  const proximoHorario = horarios
    .filter(h => h.time > horaAtualStr)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  
  if (!ultimoHorario || !proximoHorario) {
    return rota[0]; // Retornar início da rota
  }
  
  // 2. Calcular progresso entre os dois horários
  const [h1, m1] = ultimoHorario.time.split(':').map(Number);
  const [h2, m2] = proximoHorario.time.split(':').map(Number);
  const [hAtual, mAtual] = horaAtualStr.split(':').map(Number);
  
  const minInicio = h1 * 60 + m1;
  const minFim = h2 * 60 + m2;
  const minAtual = hAtual * 60 + mAtual;
  
  const progresso = (minAtual - minInicio) / (minFim - minInicio);
  
  // 3. Interpolar posição na rota
  const pontoIndex = Math.floor(progresso * (rota.length - 1));
  const pontoAtual = rota[pontoIndex];
  const proximoPonto = rota[Math.min(pontoIndex + 1, rota.length - 1)];
  
  const progressoSegmento = (progresso * (rota.length - 1)) - pontoIndex;
  
  return {
    lat: pontoAtual.lat + (proximoPonto.lat - pontoAtual.lat) * progressoSegmento,
    lng: pontoAtual.lng + (proximoPonto.lng - pontoAtual.lng) * progressoSegmento
  };
}
```

## 🗺️ Geocodificação de Endereços

O script usa Google Maps Geocoding API para converter endereços em coordenadas:

```typescript
// Exemplo de uso
const coords = await geocodeAddress('Rua Marechal Deodoro, 1234', 'Palmas, PR');
// Retorna: { lat: -26.4844, lng: -49.0761 }
```

### Dicas para Melhor Geocodificação

1. **Seja específico**: Inclua número, rua, cidade e estado
2. **Use nomes oficiais**: Prefira nomes do Google Maps
3. **Pontos de referência**: Se o endereço não existir, use pontos próximos conhecidos
4. **Validação manual**: Sempre verifique as coordenadas no mapa

## 📝 Formato do PDF da Prefeitura

Se você me enviar o PDF ou a URL, posso:

1. Extrair automaticamente os dados
2. Criar um parser específico para o formato
3. Importar todas as linhas de uma vez
4. Validar e corrigir endereços

## 🔧 Próximos Passos

1. **Me envie o PDF** ou a URL do site da prefeitura
2. Vou criar um parser automático
3. Importaremos todas as linhas com horários reais
4. Atualizaremos o app para usar horários programados
5. Melhoraremos a precisão da posição dos ônibus

## 💡 Benefícios

- ✅ Horários reais da prefeitura
- ✅ Rotas precisas usando Google Maps
- ✅ Paradas com coordenadas corretas
- ✅ Estimativa de posição baseada em horários
- ✅ Informações confiáveis para os usuários
