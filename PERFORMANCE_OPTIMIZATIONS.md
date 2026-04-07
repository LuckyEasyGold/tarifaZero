# Otimizações de Performance - TarifaZero

## Resumo das Melhorias Implementadas

### 1. **Vite Config (`vite.config.ts`)**

#### Otimizações de Build:
- **Code Splitting Avançado**: Divisão de chunks em vendors específicos:
  - `react-vendor`: React, React-DOM, React-Router-DOM
  - `leaflet-vendor`: Leaflet e componentes de mapa
  - `ui-vendor`: Componentes Radix UI mais utilizados
  - `utils-vendor`: Utilitários (Zod, clsx, tailwind-merge, etc.)

- **Minificação Otimizada**:
  - `minify: 'esbuild'` - Minificador mais rápido que Terser
  - `target: 'esnext'` - Código moderno para browsers recentes
  - `cssMinify: true` - Minificação explícita de CSS

- **Otimização de Dependências**:
  - `optimizeDeps.include`: Pré-bundle de dependências críticas
  - `optimizeDeps.exclude`: Exclusão de pacotes problemáticos (@prisma/client)

- **Configurações de Output**:
  - Nomes de arquivos com hash para cache eficiente
  - Limite de chunk aumentado para 1500KB
  - Limitação de operações paralelas para evitar sobrecarga

- **CSS**:
  - `devSourcemap: false` - Desativa source maps em desenvolvimento para maior velocidade

### 2. **TypeScript Config (`tsconfig.app.json`)**

#### Otimizações de Compilação:
- `isolatedModules: true` - Permite compilação mais rápida e transpilação paralela
- `allowSyntheticDefaultImports: true` - Compatibilidade com imports padrão
- `resolveJsonModule: true` - Suporte nativo a JSON
- `esModuleInterop: true` - Interoperabilidade com módulos ES

### 3. **Service Worker (`public/sw.js`)**

#### Melhorias de Cache:
- **Versionamento**: Atualizado para v2 com novos nomes de cache
- **Limitação de Tamanho**: Cache de API limitado a 50 entradas (evita uso excessivo de memória)
- **Estratégias Otimizadas**:
  - API: Network First com `cache: 'no-cache'` para dados frescos
  - Assets: Cache First com atualização em background seletiva
  - Ignora localhost em cache para desenvolvimento

- **Instalação Eficiente**:
  - `skipWaiting()` imediato para ativação rápida
  - Limpeza de caches antigos antes de abrir novos
  - `clients.claim()` para controle imediato

- **Requisições**:
  - Ignora requisições não-GET (mais eficiente)
  - Filtra requisições localhost do cache
  - Tratamento de erro melhorado

### 4. **Componente BusMap (`src/components/map/BusMap.tsx`)**

#### Otimizações de Renderização:
- **Memoização**: Todos os cálculos pesados estão memoizados com `useMemo`:
  - `bounds`: Cálculo de limites do mapa
  - `rotasCoords`: Conversão de coordenadas
  - `rotasPercorridas`: Cálculo de progresso das rotas

- **Referências Estáveis**: Uso de `useRef` para elementos do mapa

### Benefícios Esperados

1. **Build Mais Rápido**:
   - Esbuild é 20-40x mais rápido que Terser
   - Code splitting reduz tempo de build incremental
   - Otimização de dependências acelera HMR

2. **Bundle Menor**:
   - Code splitting estratégico reduz bundle inicial
   - Tree-shaking mais eficiente com módulos isolados
   - CSS minificado separadamente

3. **Carregamento Mais Rápido**:
   - Chunks menores carregam em paralelo
   - Cache de service worker mais eficiente
   - Less re-renders no mapa com memoização

4. **Melhor UX**:
   - Service worker ativa mais rápido
   - Cache de API limitado evita lentidão
   - Dados mais frescos com estratégia network-first

### Próximos Passos Sugeridos

1. **Lazy Loading de Rotas**
2. **Virtualização de Listas**
3. **Imagens Otimizadas**
4. **React Production Profiler**
5. **Prefetching de Rotas**

---
Data: Abril 2026
Versão: 2.5.0.4
