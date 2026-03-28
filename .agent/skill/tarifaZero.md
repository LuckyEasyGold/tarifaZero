# ROLE

Atue como Arquiteto de Software Sênior, Engenheiro Backend (Node.js/TypeScript) e Especialista em Sistemas de Geolocalização e Mobilidade Urbana.

# OBJETIVO

Projetar e implementar uma API completa para um sistema de monitoramento e roteamento de ônibus urbanos sem acesso a dados oficiais de GPS, utilizando:

* Crowdsource (usuários)
* Detecção de rede Wi-Fi (SSID/BSSID)
* Geolocalização dos dispositivos
* Inferência de movimento (simulação inteligente)

O sistema deve ser escalável, resiliente e preparado para dados imprecisos.

---

# CONTEXTO

* Existem 5 linhas de ônibus
* Não temos acesso oficial ao GPS dos veículos
* Os ônibus possuem Wi-Fi interno (roteadores)
* Usuários podem contribuir com:

  * Localização GPS
  * Identificação da rede Wi-Fi (SSID/BSSID)
* Existe um grupo inicial de 200+ usuários voluntários

---

# PROBLEMAS A RESOLVER

1. Construção de rotas reais (ida/volta)
2. Identificação de qual ônibus o usuário está
3. Determinação da posição atual do ônibus
4. Continuidade da posição mesmo sem dados (simulação)
5. Sugestão de rotas entre origem e destino

---

# REQUISITOS FUNCIONAIS

## 1. Crowdsource de Rotas

* Endpoint para gravação de trajeto:
  POST /tracking/start
  POST /tracking/point
  POST /tracking/stop

* Armazenar sequência de coordenadas com timestamp

* Criar processo de:

  * limpeza de ruído
  * simplificação de rota (Douglas-Peucker)
  * geração de "shape" oficial da rota

---

## 2. Identificação de Ônibus

Criar sistema híbrido baseado em:

* SSID da rede Wi-Fi
* BSSID (quando disponível)
* Confirmação manual do usuário
* Histórico recente de localização

Criar endpoint:
POST /vehicle/identify

Entrada:

* ssid
* bssid (opcional)
* lat
* lng

Saída:

* linha provável
* confiança (0–1)

---

## 3. Rastreamento em Tempo Real

Criar endpoint:
POST /vehicle/position

Entrada:

* user_id
* linha_id
* lat
* lng
* timestamp
* precisão

Regras:

* Agrupar usuários por linha
* Calcular posição média ponderada
* Descartar outliers

---

## 4. Motor de Inferência (SIMULAÇÃO)

Quando não houver dados recentes:

Implementar:

* cálculo de velocidade média por trecho
* consideração de horário do dia
* ajuste por tipo de trecho (subida, parada, curva)

Criar:
GET /vehicle/predict-position

Entrada:

* linha_id
* último ponto conhecido

Saída:

* posição estimada
* nível de confiança

---

## 5. Paradas e Rotas

Estruturar entidades:

* linhas
* rotas (ida/volta)
* pontos da rota (shape)
* paradas
* horários

Criar endpoints:
GET /lines
GET /lines/:id/route
GET /stops/nearby

---

## 6. Roteador (origem → destino)

Criar:
POST /route/search

Entrada:

* origem (lat,lng)
* destino (lat,lng)

Processo:

1. Encontrar paradas próximas
2. Verificar quais linhas passam por elas
3. Calcular viabilidade
4. Retornar opções ordenadas por:

   * tempo
   * distância
   * número de trocas

Saída:

* lista de rotas possíveis

---

## 7. Modelo de Dados (obrigatório)

Criar estrutura SQL com:

* lines
* routes
* route_points
* stops
* trips
* vehicle_positions
* user_tracks

---

## 8. Inteligência de Velocidade

Sistema deve aprender:

* velocidade média por trecho
* variação por horário (pico / vazio)
* tempo médio entre paradas

Atualizar dinamicamente com dados reais.

---

# REQUISITOS NÃO FUNCIONAIS

* API REST
* Node.js + TypeScript
* Banco: PostgreSQL + PostGIS
* Cache: Redis (para posições em tempo real)
* Tolerância a dados inconsistentes
* Escalabilidade horizontal

---

# DIFERENCIAIS IMPORTANTES

* Sistema funciona mesmo sem dados oficiais
* Capacidade de melhorar com o tempo
* Inferência quando offline
* Uso de múltiplas fontes (GPS + Wi-Fi + comportamento)

---

# O QUE IMPLEMENTAR PRIMEIRO (PRIORIDADE)

1. Estrutura de banco
2. Endpoint de tracking
3. Construção de rotas
4. Rastreamento básico
5. Inferência simples

---

# RESULTADO ESPERADO

Uma API funcional capaz de:

* Construir rotas reais com usuários
* Estimar posição de ônibus em tempo real
* Sugerir trajetos utilizáveis
* Evoluir automaticamente com mais dados

---

# INSTRUÇÃO FINAL

Implemente com foco em código limpo, modularização e possibilidade de evolução futura.
Evite overengineering, mas prepare pontos de extensão.
