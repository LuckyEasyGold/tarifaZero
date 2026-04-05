# TarifaZero — Convenções e Padrões

## Linguagem do projeto
- Código: TypeScript estrito
- Comentários e nomes de variáveis: português brasileiro
- Nomes de arquivos e componentes: inglês (padrão React)

## Componentes
- Sempre functional components com hooks
- Props tipadas com interface TypeScript dedicada
- Um componente por arquivo
- Nomear arquivos em PascalCase: `BusMap.tsx`, `InfoPanel.tsx`

## Estilo
- Tailwind CSS utilitário — sem CSS custom exceto quando necessário
- Componentes UI prontos via shadcn/ui (não reinventar)
- Design responsivo: mobile-first

## Tipos
- Todos os tipos globais ficam em `src/types/index.ts`
- Evitar `any` — usar tipos explícitos sempre
- Tipos de posição GPS: `{ lat: number; lng: number }`

## Hooks
- Hooks customizados em `src/hooks/`
- Nome sempre com prefixo `use`: `useGPSSimulator`, `useGPSReal`
- Cada hook com responsabilidade única

## Dados estáticos
- Ficam em `src/data/linhas.ts`
- Formato de linha de ônibus:
```ts
{
  id: 'L001',
  nome: 'Nome da Linha',
  cor: 'blue',         // nome Tailwind
  corHex: '#3B82F6',   // hex para Leaflet
  horarioInicio: '05:00',
  horarioFim: '22:00',
  intervaloMinutos: 30,
  rota: [{ lat: number, lng: number }],
  paradas: [{ id, nome, coordenadas, horarioPrevisto }]
}
```

## Mapas (Leaflet)
- Ícones customizados ficam em `src/components/map/icons.ts`
- Não usar imagens externas para ícones — gerar via DivIcon
- Cores das linhas sempre via `corHex` do objeto de linha

## Capacitor (Mobile)
- Configuração em `capacitor.config.cjs`
- Não usar APIs web que não tenham equivalente mobile (ex: prefer Capacitor Geolocation sobre navigator.geolocation)

## Commits
- Mensagens em português, imperativo: "Adiciona hook de GPS real", "Corrige cálculo de ETA"

## O que NÃO fazer
- Não criar componentes de UI do zero se já existe no shadcn/ui
- Não colocar lógica de negócio dentro de componentes — extrair para hooks
- Não hardcodar coordenadas fora de `src/data/linhas.ts`
- Não usar CSS modules — só Tailwind
