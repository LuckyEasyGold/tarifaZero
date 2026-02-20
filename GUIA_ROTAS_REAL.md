# Guia Completo - TaraifaZero com Dados Reais

Este guia explica como usar o sistema de geração automática de rotas para o TaraifaZero.

---

## 📁 Estrutura de Arquivos

```
src/data/
├── linhas.ts           # Configuração das linhas (importa os JSONs)
├── rotaL001.json       # Coordenadas da rota L001
├── paradasL001.json    # Paradas da rota L001
├── rotaL002.json       # Coordenadas da rota L002
├── paradasL002.json    # Paradas da rota L002
└── ... (L003, L004, L005)
```

---

## 🚀 Como Gerar uma Nova Rota

### 1. Obter Chave da API

1. Acesse: https://openrouteservice.org/dev/#/signup
2. Crie uma conta gratuita
3. Vá em "Dashboard" → "API Keys" → "Create API Key"
4. Copie a chave gerada

### 2. Configurar o .env

```bash
# Na raiz do projeto, copie o arquivo de exemplo:
cp .env.example .env

# Edite o arquivo .env e cole sua chave:
ORS_KEY=sua_chave_aqui
```

### 3. Configurar a Linha no Script

Edite o arquivo `scripts/gerarRota.js` e adicione sua linha na seção `CONFIGURACOES_LINHAS`:

```javascript
const CONFIGURACOES_LINHAS = {
  L001: {
    nome: "Eldorado / IFPR",
    ruasIda: [
      "Eloy Erich Bernert, Palmas PR",
      "Av. Gov. Pedro Viriato Parigot de Souza, Palmas PR",
      // ... mais ruas da ida
    ],
    ruasVolta: [
      "IFPR Palmas PR",
      "AV. Bento Munhoz da Rocha Neto, Palmas PR",
      // ... mais ruas da volta
    ]
  },
  
  // ⬇️ ADICIONE SUA NOVA LINHA AQUI:
  L002: {
    nome: "Centro - Bairro São José",
    ruasIda: [
      "Terminal Rodoviário, Palmas PR",
      "Av. Brasil, Palmas PR",
      "R. 15 de Novembro, Palmas PR",
      // ... ruas da ida
    ],
    ruasVolta: [
      "Bairro São José, Palmas PR",
      "R. 15 de Novembro, Palmas PR",
      "Av. Brasil, Palmas PR",
      // ... ruas da volta
    ]
  }
};
```

### 4. Executar o Script

```bash
cd scripts
node gerarRota.js L002
```

O script vai:
1. 🗺️ Geocodificar cada endereço (converter nome → coordenadas)
2. 🛣️ Gerar a rota completa via API ORS
3. 📍 Criar pontos a cada 300m
4. 💾 Salvar os arquivos `rotaL002.json` e `paradasL002.json`

### 5. Atualizar o App

Após gerar a rota, o arquivo `linhas.ts` já vai carregá-la automaticamente! Basta fazer o build:

```bash
cd /mnt/okcomputer/output/app
npm run build
```

---

## 📝 Formato dos Endereços

Use endereços no formato: `"Nome da Rua, Cidade PR"`

Exemplos válidos:
- `"Eloy Erich Bernert, Palmas PR"`
- `"Av. Gov. Pedro Viriato Parigot de Souza, Palmas PR"`
- `"Terminal Rodoviário, Palmas PR"`
- `"IFPR Palmas PR"`

---

## 🗺️ Como Descobrir os Nomes das Ruas

### Opção 1: Google Maps
1. Abra o Google Maps
2. Procure por "Palmas, Paraná"
3. Clique nas ruas para ver os nomes
4. Anote os nomes exatos

### Opção 2: OpenStreetMap (mais preciso)
1. Acesse: https://www.openstreetmap.org
2. Procure por "Palmas, Paraná"
3. Clique nas ruas para ver os nomes oficiais
4. Use estes nomes no script

---

## ⚠️ Dicas Importantes

### 1. Ordem das Ruas
- Liste as ruas **na ordem** que o ônibus passa
- Comece pelo ponto inicial (terminal/bairro)
- Termine no ponto final

### 2. Ida e Volta
- `ruasIda`: caminho de ida
- `ruasVolta`: caminho de volta (pode ser diferente!)

### 3. Ruas Duplicadas
Se o ônibus passa pela mesma rua mais de uma vez, liste ela novamente:
```javascript
ruasIda: [
  "R. Principal, Palmas PR",
  "R. Secundária, Palmas PR",
  "R. Principal, Palmas PR",  // ← passa de novo!
]
```

### 4. Rate Limit da API
A API ORS gratuita permite:
- 2000 requisições/dia
- 40 requisições/minuto

O script já tem delay de 200ms entre requisições para evitar bloqueios.

---

## 🔧 Solução de Problemas

### "Endereço não encontrado"
- Tente variações do nome (ex: "Av." vs "Avenida")
- Use o OpenStreetMap para ver o nome oficial
- Adicione ", Palmas PR" no final

### "Erro 401 - Unauthorized"
- Sua chave API é inválida ou expirou
- Gere uma nova chave em https://openrouteservice.org

### "Erro 429 - Too Many Requests"
- Você atingiu o limite da API gratuita
- Aguarde alguns minutos e tente novamente

---

## 📊 Estatísticas da Rota L001

| Métrica | Valor |
|---------|-------|
| Distância total | ~25 km |
| Pontos na rota | ~3.500 |
| Paradas geradas | ~3.500 |
| Tempo de geração | ~2 minutos |

---

## 🎯 Próximos Passos

1. ✅ Gerar rota L001 (Eldorado/IFPR) - **PRONTO!**
2. ⬜ Gerar rota L002 - configure no script
3. ⬜ Gerar rota L003 - configure no script
4. ⬜ Gerar rota L004 - configure no script
5. ⬜ Gerar rota L005 - configure no script

---

## 💡 Exemplo Completo: Gerar L002

```bash
# 1. Edite scripts/gerarRota.js e adicione L002
# 2. Execute:
cd scripts
node gerarRota.js L002

# 3. Faça o build
cd ..
npm run build

# 4. Deploy
# (o deploy é automático se estiver usando Vercel/Netlify)
```

---

## 📞 Precisa de Ajuda?

Se tiver dificuldades para encontrar os nomes das ruas, me envie:
1. O nome da linha (ex: "Centro - Bairro X")
2. Uma descrição do trajeto (ex: "Sai do terminal, sobe pela Av. Brasil...")
3. Principais pontos de referência

Que eu ajudo a montar a lista de ruas! 🚌
