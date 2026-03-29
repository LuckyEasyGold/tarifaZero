# 🧪 Teste das Correções - v2.1

## URLs para Testar

### Produção (Vercel)
- **URL Principal:** https://project-btoew.vercel.app
- **Último Deploy:** https://tarifazero-4926zzrmr-luckyeasygolds-projects.vercel.app
- **Inspect:** https://vercel.com/luckyeasygolds-projects/tarifazero/CS69L7tai9nn7bJhmiGdpe5G6o9v

### Local (Desenvolvimento)
- **URL:** http://localhost:5173/
- **Comando:** `npm run dev`

## ✅ Correções Aplicadas

### 1. Tela Splash
**Problema:** 
- Aparecia apenas na primeira visita
- Fallback aparecia imediatamente
- Vídeo rodava por apenas 2 segundos

**Correção:**
- ✅ Splash aparece SEMPRE (removido `localStorage`)
- ✅ Fallback aguarda 3 segundos antes de aparecer
- ✅ Botão "Pular" aparece após 2 segundos
- ✅ Vídeo toca até o fim (ou até clicar em pular)
- ✅ Tratamento de erro com `onError`

**Como Testar:**
1. Abrir a aplicação
2. Deve aparecer o vídeo splash.mp4
3. Após 2s, botão "Pular" aparece
4. Se vídeo não carregar em 3s, mostra animação com ônibus
5. Recarregar página (F5) - splash deve aparecer novamente

**Arquivos Modificados:**
- `src/App.tsx` - Removido localStorage check
- `src/components/SplashScreen.tsx` - Lógica de timing corrigida

### 2. Navegação de Linhas
**Problema:**
- Ao clicar em uma linha, dava erro "Linha não encontrada"
- API retornava erro por campo `sequence` inexistente

**Correção:**
- ✅ Endpoint `/api/lines/[id]` corrigido
- ✅ Removido campo `sequence` de stops
- ✅ Ordenação por `code` ao invés de `sequence`
- ✅ Navegação Linhas → Detalhes funcionando

**Como Testar:**
1. Ir para aba "Linhas" (ícone de lista)
2. Clicar em qualquer linha (ex: L001)
3. Deve abrir página de detalhes com:
   - Informações da linha
   - Mapa com rota
   - Lista de paradas
4. Alternar entre aba "Mapa" e "Paradas"

**Arquivos Modificados:**
- `api/lines/[id].js` - Removido sequence
- `src/pages/LinhaDetalhes.tsx` - Ordenação por code

### 3. Simulação de Ônibus no Mapa
**Problema:**
- Mapa não mostrava ônibus
- Usava dados mockados estáticos
- Sem movimento/simulação

**Correção:**
- ✅ Home busca linhas da API real
- ✅ Simula 2-3 ônibus por linha
- ✅ Ônibus se movem pela rota a cada 3 segundos
- ✅ Cada ônibus tem velocidade e direção

**Como Testar:**
1. Abrir página inicial (aba "Mapa")
2. Aguardar carregamento (spinner)
3. Deve aparecer:
   - Rotas de todas as linhas coloridas
   - Ícones de ônibus nas rotas
   - 2-3 ônibus por linha
4. Aguardar 3 segundos - ônibus devem se mover
5. Movimento contínuo pela rota

**Arquivos Modificados:**
- `src/pages/Home.tsx` - Busca API + simulação

## 🔍 Verificação de Cache

Se as mudanças não aparecerem no Vercel:

### Opção 1: Limpar Cache do Navegador
```
Chrome/Edge: Ctrl + Shift + Delete
Firefox: Ctrl + Shift + Del
```
Marcar:
- ✅ Cookies e dados de sites
- ✅ Imagens e arquivos em cache

### Opção 2: Modo Anônimo/Privado
```
Chrome/Edge: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
```

### Opção 3: Hard Refresh
```
Chrome/Edge/Firefox: Ctrl + F5
ou
Ctrl + Shift + R
```

### Opção 4: Verificar Versão
Abrir DevTools (F12) → Console → Digitar:
```javascript
console.log('App Version: v2.1');
```

Se aparecer "v2.1", está na versão correta.

## 🐛 Troubleshooting

### Splash não aparece
- Verificar console do navegador (F12)
- Verificar se arquivo `/splash.mp4` existe
- Testar localmente: http://localhost:5173/

### Erro "Linha não encontrada"
- Verificar se API está respondendo: https://project-btoew.vercel.app/api/lines
- Verificar console do navegador
- Verificar se DATABASE_URL está configurado no Vercel

### Ônibus não aparecem no mapa
- Verificar console do navegador
- Verificar se API retorna dados: https://project-btoew.vercel.app/api/lines
- Aguardar carregamento completo (pode demorar 5-10s)

### Ônibus não se movem
- Aguardar 3 segundos após carregamento
- Verificar console do navegador por erros
- Verificar se há dados de rota na API

## 📊 Checklist de Teste

- [ ] Splash aparece ao abrir aplicação
- [ ] Splash aparece ao recarregar (F5)
- [ ] Botão "Pular" funciona após 2s
- [ ] Vídeo toca até o fim (ou fallback após 3s)
- [ ] Navegação inferior funciona (4 abas)
- [ ] Aba "Linhas" lista todas as linhas
- [ ] Clicar em linha abre detalhes
- [ ] Detalhes mostram mapa e paradas
- [ ] Aba "Mapa" mostra rotas coloridas
- [ ] Ônibus aparecem nas rotas
- [ ] Ônibus se movem a cada 3s
- [ ] Múltiplos ônibus por linha

## 🚀 Próximos Passos

Após confirmar que tudo funciona:
1. Testar em dispositivo móvel
2. Testar APK Android (quando build concluir)
3. Implementar validação de Wi-Fi
4. Adicionar identificação automática de linha

## 📝 Notas

- Deploy feito em: 29/03/2026 02:17 UTC
- Commit: c0005d9
- Versão: v2.1
- Cache pode levar até 5 minutos para limpar
