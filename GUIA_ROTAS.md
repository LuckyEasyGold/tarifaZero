# Guia Completo: Como Criar Rotas Reais para o TaraifaZero

Este guia vai te ensinar a criar as 5 rotas de ônibus de Palmas - PR usando coordenadas reais do Google Maps.

---

## Passo 1: Abrir o Google Maps

1. Acesse: **https://maps.google.com**
2. Na barra de pesquisa, digite: **"Palmas, Paraná"**
3. O mapa vai centralizar na sua cidade

---

## Passo 2: Obter Coordenadas de um Ponto

### Método 1: Clique Direito (Mais Preciso)

1. **Clique com o botão direito** no local desejado (ex: ponto de ônibus)
2. Um popup aparece com as coordenadas no topo
3. **Clique nas coordenadas** para copiar

```
Exemplo: -26.48417, -51.99056
```

### Método 2: URL do Mapa

1. Clique em qualquer ponto do mapa
2. Olhe a URL do navegador:
```
https://www.google.com/maps/@-26.48417,-51.99056,15z
```
3. Os números depois de `@` são: **latitude,longitude**

---

## Passo 3: Criar uma Rota Completa

Uma rota de ônibus precisa de **pontos intermediários** (cada esquina/virada):

### Exemplo Prático - Linha Centro → Bairro:

```
Ponto 1 (Terminal):     -26.48417, -51.99056
Ponto 2 (Esquina 1):    -26.48450, -51.99000
Ponto 3 (Esquina 2):    -26.48500, -51.98900
Ponto 4 (Parada):       -26.48550, -51.98800
Ponto 5 (Esquina 3):    -26.48600, -51.98700
Ponto 6 (Destino):      -26.48700, -51.98600
```

### Dicas Importantes:

- **Quanto mais pontos, mais precisa** a rota fica
- Coloque um ponto a cada **100-200 metros** ou em cada esquina
- Siga o trajeto real que o ônibus faz
- Não precisa ser perfeito, apenas representativo

---

## Passo 4: Estrutura do Arquivo

Abra o arquivo `src/data/linhas.ts` e edite cada linha:

```typescript
export const linha1: LinhaOnibus = {
  id: 'L001',                    // Código da linha
  nome: 'Centro - Bairro X',     // Nome que aparece no app
  cor: 'blue',                   // blue, green, red, purple, orange
  corHex: '#3B82F6',             // Cor hexadecimal
  horarioInicio: '05:00',        // Primeiro horário
  horarioFim: '23:00',           // Último horário
  intervaloMinutos: 20,          // De quanto em quanto tempo passa
  
  rota: [
    // COLE AQUI TODOS OS PONTOS DA ROTA
    { lat: -26.48417, lng: -51.99056 },  // Ponto 1
    { lat: -26.48450, lng: -51.99000 },  // Ponto 2
    { lat: -26.48500, lng: -51.98900 },  // Ponto 3
    // ... continue com todos os pontos
  ],
  
  paradas: [
    // APENAS OS PONTOS DE PARADA DE ÔNIBUS
    { 
      id: 'P001', 
      nome: 'Terminal Centro', 
      coordenadas: { lat: -26.48417, lng: -51.99056 }, 
      horarioPrevisto: '05:00' 
    },
    { 
      id: 'P002', 
      nome: 'Praça Principal', 
      coordenadas: { lat: -26.48500, lng: -51.98900 }, 
      horarioPrevisto: '05:08' 
    },
    // ... adicione mais paradas
  ],
};
```

---

## Passo 5: Ferramenta Auxiliar (Recomendado)

Use o **Google My Maps** para desenhar a rota visualmente:

1. Acesse: **https://mymaps.google.com**
2. Clique em **"Criar novo mapa"**
3. Clique em **"Adicionar direções"**
4. Desenhe a rota do ônibus
5. Clique nos pontos para ver as coordenadas

---

## Exemplo Completo - Linha Real

Vamos supor que em Palmas você tenha esta linha:

**Linha: Terminal Centro → Bairro São José**

Rota real (exemplo fictício para Palmas):
```
1. Terminal Centro:      -26.48417, -51.99056
2. Av. Brasil (esquina): -26.48450, -51.99020
3. Rua 15 de Novembro:   -26.48480, -51.98980
4. Praça da Matriz:      -26.48520, -51.98930
5. Av. Paraná:           -26.48560, -51.98880
6. Bairro São José:      -26.48600, -51.98830
```

No código:
```typescript
export const linha1: LinhaOnibus = {
  id: 'L001',
  nome: 'Terminal Centro - Bairro São José',
  cor: 'blue',
  corHex: '#3B82F6',
  horarioInicio: '05:00',
  horarioFim: '23:00',
  intervaloMinutos: 20,
  rota: [
    { lat: -26.48417, lng: -51.99056 },
    { lat: -26.48450, lng: -51.99020 },
    { lat: -26.48480, lng: -51.98980 },
    { lat: -26.48520, lng: -51.98930 },
    { lat: -26.48560, lng: -51.98880 },
    { lat: -26.48600, lng: -51.98830 },
  ],
  paradas: [
    { 
      id: 'P001', 
      nome: 'Terminal Centro', 
      coordenadas: { lat: -26.48417, lng: -51.99056 }, 
      horarioPrevisto: '05:00' 
    },
    { 
      id: 'P002', 
      nome: 'Praça da Matriz', 
      coordenadas: { lat: -26.48520, lng: -51.98930 }, 
      horarioPrevisto: '05:10' 
    },
    { 
      id: 'P003', 
      nome: 'Bairro São José', 
      coordenadas: { lat: -26.48600, lng: -51.98830 }, 
      horarioPrevisto: '05:18' 
    },
  ],
};
```

---

## Cores Disponíveis

Escolha uma cor para cada linha:

| Cor | Nome | Código Hex |
|-----|------|------------|
| 🔵 Azul | `blue` | `#3B82F6` |
| 🟢 Verde | `green` | `#10B981` |
| 🔴 Vermelho | `red` | `#EF4444` |
| 🟣 Roxo | `purple` | `#8B5CF6` |
| 🟠 Laranja | `orange` | `#F59E0B` |
| 🟡 Amarelo | `yellow` | `#FBBF24` |
| 🔘 Cinza | `gray` | `#6B7280` |
| 🩷 Rosa | `pink` | `#EC4899` |

---

## Checklist antes de Salvar

- [ ] Todas as coordenadas estão no formato correto: `{ lat: -26.48417, lng: -51.99056 }`
- [ ] A latitude é sempre **negativa** (hemisfério sul)
- [ ] A longitude é sempre **negativa** (Brasil)
- [ ] Cada parada tem um `id` único (P001, P002, P003...)
- [ ] Os horários estão no formato `HH:MM`
- [ ] Testei no app e a rota aparece corretamente

---

## Precisa de Ajuda?

Se tiver dificuldade para encontrar coordenadas, me envie:

1. **Nome das 5 linhas** de ônibus
2. **Principais pontos de parada** de cada uma
3. **Rua por onde passa** (ex: "sai do Terminal, sobe pela Av. Brasil, vira na Rua 15...")

Com essas informações posso te ajudar a montar as rotas!

---

## Próximo Passo

Depois de editar o arquivo `linhas.ts`:

```bash
# Rebuild do projeto
cd /mnt/okcomputer/output/app
npm run build

# Deploy atualizado
```

Ou me peça para fazer isso por você! 🚌
