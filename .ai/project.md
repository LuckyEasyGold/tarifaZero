# TarifaZero — Visão Geral do Projeto

## O que é
Sistema web/mobile de rastreamento de ônibus em tempo real para transporte público municipal.
Inspirado no Uber: usuário abre o app e vê o ônibus se movendo no mapa.

## URL de produção
https://newsdrop.net.br/TarifaZero/

## Stack
- **Frontend:** React + TypeScript + Vite
- **Estilo:** Tailwind CSS + shadcn/ui
- **Mapas:** Leaflet
- **Mobile:** Capacitor (iOS/Android)
- **GPS atual:** Simulado via hook `useGPSSimulator.ts`
- **GPS futuro:** WebSocket ou polling contra API backend

## Estrutura de pastas
```
src/
├── components/
│   ├── Header.tsx           # Cabeçalho com logo
│   ├── SeletorLinha.tsx     # Dropdown de seleção de linha
│   ├── InfoPanel.tsx        # Painel de informações e controles
│   └── map/
│       ├── BusMap.tsx       # Componente do mapa Leaflet
│       └── icons.ts         # Ícones customizados do mapa
├── data/
│   └── linhas.ts            # Dados estáticos das 5 linhas de ônibus
├── hooks/
│   └── useGPSSimulator.ts   # Hook de simulação GPS (substituir por real futuramente)
├── types/
│   └── index.ts             # Tipos TypeScript globais
└── App.tsx                  # Componente raiz
scripts/                     # Scripts utilitários (ex: geração de rotas)
```

## Funcionalidades existentes
- Mapa em tempo real (simulado) com Leaflet
- 5 linhas de ônibus com rotas, cores e horários
- Paradas clicáveis com horários previstos
- Controles: Iniciar / Pausar / Reiniciar simulação
- Design responsivo (desktop + mobile)
- Sem autenticação (acesso direto)

## Fase atual do projeto
Versão 1.3.2 — Frontend funcional com GPS simulado.
Próximo grande passo: integração com rastreador GPS real via backend.

## Integrações planejadas (ainda não implementadas)
- Backend para receber posições GPS (POST /api/posicao)
- WebSocket para push de posição em tempo real
- Opções de backend: Firebase, Supabase, Node.js + Socket.io
