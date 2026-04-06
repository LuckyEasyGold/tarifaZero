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

## Por que permitir gravação sem validação WiFi?
- **Decisão:** Permitir gravação mesmo sem WiFi validado (modo "GPS Only - Sem Validacao")
- **Justificativa:** Melhor ter rotas sem validação do que nenhuma rota
- **Implementação:** Usuário recebe alerta e pode confirmar que está no ônibus mesmo sem WiFi
- **Arquivo:** `src/pages/Contribuir.tsx`, função `handleStartTracking`

## Por que adicionar botão "Pular WiFi"?
- **Decisão:** Adicionar botão explícito para pular validação WiFi
- **Justificativa:** Usuários precisam de uma forma fácil de testar o fluxo sem precisar de WiFi
- **Implementação:** Botão que define `wifiValidated = true` com `ssid: 'GPS Only - Sem Validacao'`
- **Arquivo:** `src/pages/Contribuir.tsx`, função `handleSkipWifi`

## Por que incrementar versão automaticamente no release.bat?
- **Decisão:** Incrementar build number automaticamente no release.bat
- **Justificativa:** Consistência com release.ps1 e evitar erros de versionamento
- **Implementação:** Script detecta versão atual e incrementa o build number
- **Arquivo:** `release.bat`, linha ~15-25

## Por que adicionar push automático no release.ps1?
- **Decisão:** Adicionar `git push origin main` após commit no release.ps1
- **Justificativa:** Fluxo completo de release sem necessidade de comandos manuais
- **Implementação:** `git push origin main` após commit
- **Arquivo:** `release.ps1`, linha ~125-127

## Por que implementar validação por trajeto?
- **Decisão:** Implementar validação por trajeto (comparar deslocamento com rotas já gravadas)
- **Justificativa:** Se o trajeto do usuário coincide com a rota da linha, é provável que esteja no ônibus correto
- **Implementação:** Endpoint `/wifi/validate-by-trajeto` que calcula distância média entre pontos do usuário e a rota da linha
- **Arquivo:** `api/index.js`, função `handleWifi`, linha ~350
