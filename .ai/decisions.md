# TarifaZero — Decisões Técnicas

## Por que Leaflet e não Google Maps?
- Leaflet é open source e gratuito (sem billing por requisição)
- OpenStreetMap como tile provider: sem custo
- Google Maps exigiria chave de API com cobrança acima do free tier

## Por que shadcn/ui?
- Componentes acessíveis e customizáveis
- Não é uma biblioteca de componentes pesada — copia o código para o projeto
- Integra nativamente com Tailwind

## Por que Capacitor e não React Native?
- Permite reutilizar 100% do código web existente
- Menor curva de aprendizado para quem já tem o frontend pronto
- Trade-off: performance nativa inferior ao RN, aceitável para este caso de uso

## Por que simulação GPS em vez de GPS real?
- Permite desenvolvimento e demo sem depender de hardware físico
- A arquitetura já está preparada para substituição (hook isolado `useGPSSimulator`)
- Substituição planejada: criar `useGPSReal` com mesma interface, trocar no `App.tsx`

## Estratégia para GPS real (decisão pendente de implementação)
Opções avaliadas:
1. **WebSocket** — menor latência, mais complexo de hospedar
2. **Polling HTTP** — mais simples, latência de 3-5s aceitável para ônibus
3. **Firebase Realtime Database** — sem servidor próprio, gratuito para começar ✅ preferida para MVP

## Por que sem autenticação no frontend?
- App é público por design — qualquer pessoa pode ver onde o ônibus está
- Autenticação será necessária apenas no lado do motorista (envio de posição)

## Estrutura de coordenadas
Padrão: `{ lat: number; lng: number }` em todos os lugares.
Nunca usar array `[lat, lng]` para evitar confusão com a ordem Leaflet vs GeoJSON.
