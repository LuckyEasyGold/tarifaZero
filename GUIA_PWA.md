# 📱 Guia PWA - Tarifa Zero

## O que é PWA?

PWA (Progressive Web App) é uma aplicação web que funciona como um app nativo:
- ✅ Instalável na tela inicial
- ✅ Funciona offline (com cache)
- ✅ Não precisa de loja de apps
- ✅ Sem aviso de "app perigoso"
- ✅ Atualização automática
- ✅ Menor tamanho (sem download de APK)

---

## 🎯 Vantagens do PWA vs APK

### Para Usuários Comuns (Visualização)

| Recurso | PWA | APK |
|---------|-----|-----|
| Instalação | Simples (1 clique) | Requer permitir "fontes desconhecidas" |
| Aviso de segurança | ❌ Não | ✅ Sim (assustador) |
| Tamanho | ~2 MB (cache) | ~7.5 MB |
| Atualização | Automática | Manual |
| Ver mapa | ✅ | ✅ |
| Ver linhas | ✅ | ✅ |
| Ver ranking | ✅ | ✅ |
| Contribuir (WiFi) | ❌ | ✅ |

### Para Colaboradores (Mapeamento)

- **PWA**: Perfeito para visualizar dados, mas não pode detectar WiFi
- **APK**: Necessário para contribuir com mapeamento (detecta WiFi do ônibus)

---

## 📲 Como Instalar o PWA

### Android (Chrome/Edge)

1. Acesse: https://tarifazero.vercel.app
2. Aguarde o banner de instalação aparecer (3 segundos)
3. Clique em "Instalar"
4. Ou: Menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"

### iOS (Safari)

1. Acesse: https://tarifazero.vercel.app
2. Toque no botão de compartilhar (□↑)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Toque em "Adicionar"

### Desktop (Chrome/Edge)

1. Acesse: https://tarifazero.vercel.app
2. Clique no ícone de instalação na barra de endereço
3. Ou: Menu (⋮) → "Instalar Tarifa Zero"

---

## 🔧 Recursos Implementados

### 1. Manifest (`public/manifest.json`)
- Nome do app
- Ícones em múltiplos tamanhos
- Cor do tema
- Modo standalone (tela cheia)
- Atalhos rápidos (Mapa, Linhas, Contribuir)

### 2. Service Worker (`public/sw.js`)
- Cache de assets estáticos
- Cache de API (funciona offline)
- Sincronização em background
- Suporte a notificações push (futuro)

### 3. Componente de Instalação (`PWAInstallPrompt`)
- Banner automático após 3 segundos
- Botão de instalação
- Pode ser dispensado
- Não aparece se já instalado

### 4. Hook PWA (`usePWA`)
- Detecta se é instalável
- Detecta se já está instalado
- Detecta se está rodando como PWA
- Função para instalar programaticamente

---

## 🚀 Fluxo de Uso Recomendado

### Cenário 1: Usuário Comum (Apenas Visualizar)

```
1. Acessa tarifazero.vercel.app
2. Vê banner "Instalar Tarifa Zero"
3. Clica em "Instalar"
4. App aparece na tela inicial
5. Usa normalmente (mapa, linhas, ranking)
```

**Vantagens:**
- Sem aviso de segurança
- Instalação rápida
- Atualização automática
- Funciona offline (dados em cache)

### Cenário 2: Colaborador (Mapear Rotas)

```
1. Acessa tarifazero.vercel.app
2. Tenta contribuir → Vê mensagem "WiFi não disponível no PWA"
3. Baixa APK do GitHub ou recebe por WhatsApp
4. Instala APK (permite fontes desconhecidas)
5. Usa APK para contribuir (detecta WiFi)
6. Usa PWA para visualizar dados
```

**Vantagens:**
- PWA para uso diário (sem aviso)
- APK apenas quando for contribuir
- Melhor experiência geral

---

## 💡 Mensagem para Colaboradores

Adicione na página Contribuir uma mensagem explicativa:

```
📱 Usando PWA?

O PWA não consegue detectar redes WiFi por limitações do navegador.

Para contribuir com o mapeamento:
1. Baixe o APK completo
2. Instale no seu celular
3. Use o APK quando estiver no ônibus

O PWA é perfeito para visualizar dados, mas o APK é necessário para contribuir!
```

---

## 🔄 Cache e Offline

### O que funciona offline:

- ✅ Visualizar mapa (última versão)
- ✅ Ver linhas (última versão)
- ✅ Ver ranking (última versão)
- ✅ Interface completa

### O que NÃO funciona offline:

- ❌ Dados em tempo real
- ❌ Atualização de posições
- ❌ Enviar tracking
- ❌ Contribuir

### Estratégia de Cache:

**Assets Estáticos (HTML, CSS, JS):**
- Cache First → Busca do cache, atualiza em background

**API:**
- Network First → Busca da rede, fallback para cache se offline

---

## 📊 Estatísticas de Uso

### Tamanho Comparativo:

- **APK**: ~7.5 MB
- **PWA (cache inicial)**: ~2 MB
- **PWA (cache completo)**: ~5 MB

### Tempo de Instalação:

- **APK**: ~30 segundos (download + instalação + aviso)
- **PWA**: ~3 segundos (1 clique)

---

## 🎨 Personalização

### Ícones Necessários:

```
public/
├── logoTarifaZero.png (512x512) ✅ Já existe
├── icon-192.png (192x192) ⚠️ Criar
├── icon-512.png (512x512) ⚠️ Criar
└── favicon.ico ⚠️ Criar
```

### Gerar Ícones:

1. Use: https://realfavicongenerator.net/
2. Upload: `public/logoTarifaZero.png`
3. Baixe o pacote
4. Extraia para `public/`

---

## 🧪 Testar PWA

### Desenvolvimento Local:

```bash
npm run build
npm run preview
```

Acesse: http://localhost:4173

### Produção:

```bash
git add .
git commit -m "feat: PWA implementado"
git push
```

Acesse: https://tarifazero.vercel.app

### Verificar Instalação:

1. Chrome DevTools → Application → Manifest
2. Chrome DevTools → Application → Service Workers
3. Lighthouse → PWA Score

---

## ✅ Checklist de Deploy

- [x] Manifest criado (`public/manifest.json`)
- [x] Service Worker criado (`public/sw.js`)
- [x] Service Worker registrado (`src/main.tsx`)
- [x] Meta tags PWA no `index.html`
- [x] Componente de instalação (`PWAInstallPrompt`)
- [x] Hook PWA (`usePWA`)
- [ ] Ícones em múltiplos tamanhos
- [ ] Testar instalação no Android
- [ ] Testar instalação no iOS
- [ ] Testar offline
- [ ] Deploy no Vercel

---

## 🎯 Resultado Esperado

Após o deploy:

1. ✅ Usuário acessa tarifazero.vercel.app
2. ✅ Banner de instalação aparece
3. ✅ Clica em "Instalar"
4. ✅ App aparece na tela inicial
5. ✅ Abre como app nativo (sem barra do navegador)
6. ✅ Funciona offline (dados em cache)
7. ✅ Atualiza automaticamente quando online

---

## 📞 Suporte

Se o PWA não aparecer para instalação:

1. Verifique se está em HTTPS (Vercel já é)
2. Verifique se o manifest está acessível: `/manifest.json`
3. Verifique se o Service Worker está registrado: DevTools → Application
4. Limpe o cache e recarregue
5. Teste em modo anônimo

---

## 🚀 Próximos Passos

1. Gerar ícones em múltiplos tamanhos
2. Fazer deploy no Vercel
3. Testar instalação em diferentes dispositivos
4. Adicionar mensagem na página Contribuir sobre PWA vs APK
5. Criar tutorial de instalação para usuários
6. Compartilhar link do PWA ao invés do APK para usuários comuns
