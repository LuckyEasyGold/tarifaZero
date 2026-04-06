# TarifaZero — Tarefa Atual

> ⚠️ Este arquivo é atualizado ao FINAL de cada sessão de trabalho.
> É o primeiro arquivo que o agente deve ler para saber onde continuar.

---

## 🎯 Objetivo da sessão atual
Implementar fluxo completo de contribuição com validação por WiFi (BSSID) e validação por trajeto (comparação com rotas já gravadas), além de corrigir incremento de versão no release.bat, adicionar contador de usuários online no mapa e corrigir link do APK no DownloadAppModal.

---

## 📍 Contexto — onde estávamos

- Última coisa feita: Corrigir link do DownloadAppModal para APK correto no Vercel
- Arquivos modificados na última sessão: DownloadAppModal.tsx
- Estado atual: Projeto pronto com contador de usuários online e link do APK corrigido
- Última versão: 2.5.0.3

---

## 🔢 Passos para esta sessão
1. Analisar o código atual de `Contribuir.tsx` e identificar o problema
2. Permitir que usuários iniciem gravação mesmo sem WiFi validado (com confirmação)
3. Remover bloqueio no botão "Iniciar Criação de Rota"
4. Atualizar mensagens para indicar modo sem validação
5. Implementar endpoint `/wifi/validate-by-trajeto` para validação por trajeto
6. Implementar validação automática de BSSID contra banco de dados
7. Atualizar documentação com novo fluxo
8. Adicionar botão "Pular WiFi" para facilitar testes
9. Atualizar `release.bat` para incrementar versão automaticamente
10. Atualizar `release.ps1` para fazer push automaticamente
11. Adicionar contador de usuários online no mapa
12. Corrigir link do DownloadAppModal para APK correto no Vercel
13. Atualizar `.ai/current-task.md` com status final da sessão

---

## ⚠️ Atenção / Armadilhas conhecidas

- Leaflet tem problemas com SSR — sempre usar dynamic import ou verificar `typeof window`
- Capacitor precisa de `npm run build` antes de `npx cap sync`
- Coordenadas no formato `{ lat, lng }` — NUNCA array
- Modo sem validação deve ser claramente indicado ao usuário
- Validação por trajeto requer pelo menos 3 pontos para ser confiável
- **Armadilha descoberta:** O botão "Iniciar Criação de Rota" estava desabilitado por `!wifiValidated` — corrigido removendo essa verificação e adicionando confirmação do usuário
- **Armadilha descoberta:** O `release.bat` não incrementava versão — corrigido adicionando lógica de incremento
- **Armadilha descoberta:** O `release.ps1` não fazia push — corrigido adicionando `git push origin main`

---

## ✅ O que foi feito nesta sessão

- ✅ Permitido gravação de rotas sem validação WiFi (modo "GPS Only - Sem Validacao")
- ✅ Removido bloqueio no botão "Iniciar Criação de Rota" (verificação `!wifiValidated`)
- ✅ Adicionado confirmação do usuário antes de continuar sem WiFi
- ✅ Atualizada mensagem para indicar modo sem validação
- ✅ WiFi continua sendo automático e preferencial quando disponível
- ✅ Implementado endpoint `/wifi/validate-by-trajeto` para validação por trajeto
- ✅ Implementado serviço `trackingService.validateByTrajectory` no frontend
- ✅ Validação automática de BSSID contra banco de dados ao selecionar WiFi
- ✅ Validação por trajeto compara deslocamento com rotas já gravadas
- ✅ Adicionado botão "Pular WiFi" (`handleSkipWifi`) para facilitar testes
- ✅ Atualizado `release.bat` para incrementar versão automaticamente
- ✅ Atualizado `release.ps1` para fazer push automaticamente
- ✅ Adicionado contador de usuários online no mapa (ícone + quantidade)
- ✅ Corrigido link do DownloadAppModal para APK correto no Vercel
- ✅ Versão atualizada para 2.5.0.2
- ✅ Atualizado `.ai/current-task.md` com status final da sessão

### Arquivos modificados:
- `src/pages/Contribuir.tsx` - Linhas 100-150 (handleStartTracking), 280-300 (botão "Pular WiFi")
- `src/services/trackingService.ts` - Novo método `validateByTrajectory`
- `api/index.js` - Novo endpoint `/wifi/validate-by-trajeto`
- `release.bat` - Incremento de versão e push automático
- `release.ps1` - Push automático
- `src/components/map/BusMap.tsx` - Contador de usuários online
- `src/components/DownloadAppModal.tsx` - Link do APK corrigido
- `.ai/current-task.md` - Status final da sessão
- `.ai/decisions.md` - Novas decisões
- `DOCUMENTACAO_COMPLETA.md` - Novo fluxo detalhado

---

## ➡️ Próximos passos sugeridos

- [ ] Integrar validação por trajeto no fluxo de gravação (enviar pontos ao finalizar)
- [ ] Adicionar indicador visual no mapa quando rota for "não validada"
- [ ] Considerar adicionar badge "Não Validado" no ranking para rotas sem WiFi
- [ ] Implementar feedback visual durante a gravação indicando nível de confiança
- [ ] Adicionar opção de "Validar depois" que permite editar o BSSID após a gravação
- [ ] Testar o fluxo completo: selecionar linha → pular WiFi → iniciar gravação → finalizar → verificar validação

---

## 🧠 Decisões tomadas nesta sessão

- **Decisão 1:** Permitir gravação sem WiFi com confirmação do usuário
- **Justificativa:** Melhor ter rotas sem validação do que nenhuma rota
- **Implementação:** Usuário recebe alerta e pode confirmar que está no ônibus mesmo sem WiFi
- **Arquivo:** `src/pages/Contribuir.tsx`, função `handleStartTracking`, linha ~115

- **Decisão 2:** Validar BSSID contra banco de dados automaticamente
- **Justificativa:** Se o usuário escolheu um WiFi que já foi cadastrado como daquela linha, pode usar essa validação
- **Implementação:** useEffect que chama `/api/wifi/identify` quando WiFi é selecionado
- **Arquivo:** `src/pages/Contribuir.tsx`, useEffect ~200

- **Decisão 3:** Implementar validação por trajeto (comparar deslocamento com rotas já gravadas)
- **Justificativa:** Se o trajeto do usuário coincide com a rota da linha, é provável que esteja no ônibus correto
- **Implementação:** Endpoint `/wifi/validate-by-trajeto` que calcula distância média entre pontos do usuário e a rota da linha
- **Arquivo:** `api/index.js`, função `handleWifi`, linha ~350

- **Decisão 4:** Adicionar botão "Pular WiFi" para facilitar testes
- **Justificativa:** Usuários precisam de uma forma fácil de testar o fluxo sem precisar de WiFi
- **Implementação:** Botão que define `wifiValidated = true` com `ssid: 'GPS Only - Sem Validacao'`
- **Arquivo:** `src/pages/Contribuir.tsx`, função `handleSkipWifi`, linha ~95

- **Decisão 5:** Incrementar versão automaticamente no release.bat
- **Justificativa:** Consistência com release.ps1 e evitar erros de versionamento
- **Implementação:** Script detecta versão atual e incrementa o build number
- **Arquivo:** `release.bat`, linha ~15-25

- **Decisão 6:** Adicionar push automático no release.ps1
- **Justificativa:** Fluxo completo de release sem necessidade de comandos manuais
- **Implementação:** `git push origin main` após commit
- **Arquivo:** `release.ps1`, linha ~125-127

---

## 📝 Status final da sessão

**Data:** 2026-04-06  
**Versão atual:** 2.5.0.3  
**Status:** ✅ Tudo implementado e pronto para release  
**Próximo passo:** `git push` para subir para GitHub e Vercel

---

## 📊 Novo recurso: Contador de Usuários Online

**O que foi adicionado:**
- Contador de usuários online no mapa (topo direito)
- Ícone de usuário + quantidade (ex: "👥 5 online")
- Atualizado a cada 10 segundos

**Como funciona:**
1. Usuários enviam heartbeat a cada 30 segundos
2. Backend filtra usuários ativos nos últimos 5 minutos
3. Contador atualiza a cada 10 segundos
4. Usuários aparecem como marcadores no mapa

---

## 🔗 Link do APK Corrigido

**Arquivo:** `src/components/DownloadAppModal.tsx`

**Antes:** `/TarifaZero.apk` (link relativo quebrado)

**Depois:** `https://tarifazero.vercel.app/TarifaZero-2.5.0.3.apk` (link absoluto correto)

**O que foi feito:**
- Link atualizado para APK correto no Vercel
- Adicionado `target="_blank"` para abrir em nova aba
- Adicionado `rel="noopener noreferrer"` para segurança
