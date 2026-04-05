# TarifaZero — Progresso do Projeto

## ✅ Concluído

### Frontend (v1.3.2)
- [x] Estrutura base React + TypeScript + Vite
- [x] Integração Leaflet para mapa interativo
- [x] 5 linhas de ônibus com rotas, paradas e horários
- [x] Hook `useGPSSimulator` — movimento simulado do ônibus na rota
- [x] Componente `BusMap` com marcadores e polylines
- [x] Componente `InfoPanel` com controles (Iniciar/Pausar/Reiniciar)
- [x] Componente `SeletorLinha` — dropdown de seleção de linha
- [x] Design responsivo com Tailwind + shadcn/ui
- [x] Configuração Capacitor para build mobile
- [x] Deploy em produção: newsdrop.net.br/TarifaZero/

### Documentação
- [x] README.md completo com instruções de uso e deploy
- [x] GUIA_ROTAS.md e GUIA_ROTAS_REAL.md
- [x] info.md com detalhes do projeto
- [x] .env.example com variáveis de ambiente necessárias

---

## 🔄 Em andamento
*(atualizar a cada sessão)*

---

## 📋 Backlog (próximas features)

### Alta prioridade
- [ ] Hook `useGPSReal` — substituir simulação por dados reais via WebSocket
- [ ] Backend para receber posições GPS (endpoint POST /api/posicao)
- [ ] Integração WebSocket no frontend para receber posição em tempo real

### Média prioridade
- [ ] Cálculo de ETA real baseado na posição atual do ônibus
- [ ] Notificações: "Ônibus chegando em X minutos na sua parada"
- [ ] Múltiplos ônibus por linha (frota)
- [ ] Histórico de posições

### Baixa prioridade / Futuro
- [ ] Autenticação de motorista para envio de posição
- [ ] Painel administrativo de rotas
- [ ] Suporte a mais cidades/municipios
- [ ] PWA offline mode

---

## 🐛 Bugs conhecidos
*(registrar aqui)*
