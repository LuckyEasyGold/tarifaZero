# TarifaZero — Tarefa Atual

> ⚠️ Este arquivo é atualizado ao FINAL de cada sessão de trabalho.
> É o primeiro arquivo que o agente deve ler para saber onde continuar.

---

## 🎯 Objetivo da sessão atual
Implementar fluxo completo de contribuição com validação por WiFi (BSSID) e validação por trajeto (comparação com rotas já gravadas), além de corrigir incremento de versão no release.bat.

---

## 📍 Contexto — onde estávamos

- Última coisa feita: Análise do fluxo de contribuição do usuário
- Arquivos modificados na última sessão: nenhum
- Estado atual: Projeto funcionando, mas com bloqueio que impedia gravação sem WiFi validado

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

---

## ⚠️ Atenção / Armadilhas conhecidas

- Leaflet tem problemas com SSR — sempre usar dynamic import ou verificar `typeof window`
- Capacitor precisa de `npm run build` antes de `npx cap sync`
- Coordenadas no formato `{ lat, lng }` — NUNCA array
- Modo sem validação deve ser claramente indicado ao usuário

---

## ✅ O que foi feito nesta sessão

- ✅ Permitido gravação de rotas sem validação WiFi (modo "GPS Only - Sem Validacao")
- ✅ Removido bloqueio no botão "Iniciar Criação de Rota"
- ✅ Adicionado confirmação do usuário antes de continuar sem WiFi
- ✅ Atualizada mensagem para indicar modo sem validação
- ✅ WiFi continua sendo automático e preferencial quando disponível
- ✅ Implementado endpoint `/wifi/validate-by-trajeto` para validação por trajeto
- ✅ Implementado serviço `trackingService.validateByTrajectory` no frontend
- ✅ Validação automática de BSSID contra banco de dados ao selecionar WiFi
- ✅ Validação por trajeto compara deslocamento com rotas já gravadas
- ✅ Adicionado botão "Pular WiFi" para facilitar testes
- ✅ Atualizado `release.bat` para incrementar versão automaticamente
- ✅ Versão atualizada para 2.5.0.2

---

## ➡️ Próximos passos sugeridos

- [ ] Integrar validação por trajeto no fluxo de gravação (enviar pontos ao finalizar)
- [ ] Adicionar indicador visual no mapa quando rota for "não validada"
- [ ] Considerar adicionar badge "Não Validado" no ranking para rotas sem WiFi
- [ ] Implementar feedback visual durante a gravação indicando nível de confiança
- [ ] Adicionar opção de "Validar depois" que permite editar o BSSID após a gravação

---

## 🧠 Decisões tomadas nesta sessão

- **Decisão 1:** Permitir gravação sem WiFi com confirmação do usuário
- **Justificativa:** Melhor ter rotas sem validação do que nenhuma rota
- **Implementação:** Usuário recebe alerta e pode confirmar que está no ônibus mesmo sem WiFi

- **Decisão 2:** Validar BSSID contra banco de dados automaticamente
- **Justificativa:** Se o usuário escolheu um WiFi que já foi cadastrado como daquela linha, pode usar essa validação
- **Implementação:** useEffect que chama `/api/wifi/identify` quando WiFi é selecionado

- **Decisão 3:** Implementar validação por trajeto (comparar deslocamento com rotas já gravadas)
- **Justificativa:** Se o trajeto do usuário coincide com a rota da linha, é provável que esteja no ônibus correto
- **Implementação:** Endpoint `/wifi/validate-by-trajeto` que calcula distância média entre pontos do usuário e a rota da linha
