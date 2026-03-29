# TarifaZero - Rastreamento de Ônibus

Sistema web de rastreamento de ônibus em tempo real, inspirado no Uber. Permite aos usuários acompanhar a localização dos ônibus, ver rotas, paradas e tempos estimados de chegada.

## Funcionalidades

- **Mapa em tempo real**: Acompanhe o ônibus se movendo no mapa
- **5 linhas de ônibus**: Cada uma com sua rota, cor e horários
- **Paradas com horários**: Clique nas paradas para ver informações
- **Simulação GPS**: Simula o movimento do ônibus pela rota
- **Design responsivo**: Funciona em desktop e mobile
- **Sem login necessário**: Acesso direto e simples

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Leaflet (mapas)
- Hooks personalizados para simulação GPS

## Como usar

1. Selecione a linha de ônibus desejada no menu dropdown
2. Veja o ônibus no mapa em tempo real
3. Use os botões Iniciar/Pausar/Reiniciar para controlar a simulação
4. Clique no ônibus ou nas paradas para ver detalhes

## Estrutura do Projeto

```
src/
├── components/
│   ├── Header.tsx           # Cabeçalho com logo
│   ├── SeletorLinha.tsx     # Dropdown de seleção de linha
│   ├── InfoPanel.tsx        # Painel de informações e controles
│   └── map/
│       ├── BusMap.tsx       # Componente do mapa Leaflet
│       └── icons.ts         # Ícones customizados
├── data/
│   └── linhas.ts            # Dados das 5 linhas de ônibus
├── hooks/
│   └── useGPSSimulator.ts   # Hook de simulação GPS
├── types/
│   └── index.ts             # Tipos TypeScript
└── App.tsx                  # Componente principal
```

## Integração com Rastreador Real

Para usar com um rastreador GPS real no ônibus:

### 1. Hardware Necessário

- Rastreador GPS com conectividade (4G/WiFi)
- Exemplos: TK103, GT06N, ou soluções customizadas com ESP32 + GPS module

### 2. API Backend

Crie um endpoint simples para receber as coordenadas:

```javascript
// POST /api/posicao
{
  "linhaId": "L001",
  "lat": -23.5505,
  "lng": -46.6333,
  "velocidade": 35,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Modificar o Frontend

Substitua o hook `useGPSSimulator` por uma conexão real:

```typescript
// useGPSReal.ts
import { useEffect, useState } from 'react';
import { PosicaoOnibus } from '@/types';

export const useGPSReal = (linhaId: string) => {
  const [posicao, setPosicao] = useState<PosicaoOnibus | null>(null);

  useEffect(() => {
    // Conectar ao WebSocket ou fazer polling
    const ws = new WebSocket(`wss://sua-api.com/ws/${linhaId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPosicao({
        linhaId: data.linhaId,
        coordenadas: { lat: data.lat, lng: data.lng },
        velocidade: data.velocidade,
        ultimaAtualizacao: new Date(data.timestamp),
        sentido: data.sentido,
      });
    };

    return () => ws.close();
  }, [linhaId]);

  return { posicao };
};
```

### 4. Opções de Hospedagem do Backend

- **Firebase Realtime Database**: Gratuito para começar
- **Supabase**: PostgreSQL + Realtime subscriptions
- **Node.js + Socket.io**: Solução própria
- **AWS IoT Core**: Para escala empresarial

## Deploy

### Opção 1: Vercel (Recomendado)

1. Instale a CLI: `npm i -g vercel`
2. Execute: `vercel --prod`
3. Ou conecte seu GitHub na dashboard da Vercel

### Opção 2: Netlify

1. Build: `npm run build`
2. Deploy da pasta `dist/`

### Opção 3: Servidor Próprio

1. Build: `npm run build`
2. Copie a pasta `dist/` para seu servidor
3. Sirva o `index.html` com qualquer servidor web

## Personalização

### Adicionar Novas Linhas

Edite `src/data/linhas.ts` e adicione uma nova linha seguindo o formato:

```typescript
export const linha6: LinhaOnibus = {
  id: 'L006',
  nome: 'Nome da Nova Linha',
  cor: 'pink',
  corHex: '#EC4899',
  horarioInicio: '05:00',
  horarioFim: '22:00',
  intervaloMinutos: 30,
  rota: [
    { lat: -23.5505, lng: -46.6333 },
    // ... mais coordenadas
  ],
  paradas: [
    { id: 'P001', nome: 'Parada 1', coordenadas: { lat: -23.5505, lng: -46.6333 }, horarioPrevisto: '05:00' },
    // ... mais paradas
  ],
};
```

### Obter Coordenadas Reais

Use o Google Maps ou OpenStreetMap para obter coordenadas precisas:

1. Abra o Google Maps
2. Clique com botão direito no ponto desejado
3. Copie as coordenadas (lat, lng)

## Licença

MIT - Livre para uso e modificação.

---

Desenvolvido para facilitar o transporte público da sua cidade! 🚌
