# Guia de Teste Completo - Tarifa Zero

## 🔴 IMPORTANTE: Antes de Testar

### 1. Aplicar Migração no Banco de Dados (OBRIGATÓRIO)

Você PRECISA aplicar a migração no Neon antes de testar qualquer coisa!

**Opção A: Via Prisma (Recomendado)**
```bash
cd C:\projetos\tarifaZero
npx prisma migrate dev --name add_temp_stops_and_fix_wifi
npx prisma generate
```

**Opção B: Manualmente no Console do Neon**
1. Acesse https://console.neon.tech
2. Abra seu projeto
3. Vá em "SQL Editor"
4. Execute os comandos do arquivo `MIGRACAO_BANCO.md`

### 2. Aguardar Deploy no Vercel

O código foi enviado para o GitHub. Aguarde o deploy no Vercel terminar:
- Acesse https://vercel.com/dashboard
- Verifique se o deploy de `tarifazero` está completo
- Status deve estar "Ready"

### 3. Gerar Novo APK

Depois da migração e do deploy:
```bash
cd C:\projetos\tarifaZero
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
```

O APK estará em: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 📱 Testes no APK

### Teste 1: Tela de Boas-Vindas
- [ ] Abrir APK pela primeira vez
- [ ] Splash screen aparece
- [ ] Tela de boas-vindas aparece
- [ ] Digitar um nickname (ex: "João")
- [ ] Aceitar termos
- [ ] Clicar em "Começar a Contribuir"
- [ ] App abre na Home

**Verificar no Neon:**
```sql
SELECT anonymous_id, nickname, accepted_terms FROM users ORDER BY created_at DESC LIMIT 5;
```
- Deve aparecer o usuário com o nickname "João"

---

### Teste 2: WiFi Scanner
- [ ] Ir para página "Contribuir"
- [ ] Selecionar uma linha (ex: "L001")
- [ ] Aguardar 1-2 segundos
- [ ] Card "Escolha o Wi-Fi do Ônibus" deve aparecer
- [ ] Lista de redes WiFi deve aparecer
- [ ] Clicar em uma rede WiFi
- [ ] Mensagem "Obrigado! Wi-Fi salvo" aparece
- [ ] Card fecha automaticamente

**Se não aparecer redes:**
1. Verificar se o celular tem WiFi ligado
2. Verificar se o app tem permissão de localização
3. Verificar logs no Android Studio:
   ```bash
   adb logcat | grep -i wifi
   ```

**Verificar no Neon:**
```sql
SELECT * FROM wifi_networks ORDER BY created_at DESC LIMIT 5;
```
- Deve aparecer o BSSID salvo associado à linha

---

### Teste 3: Criação de Rota
- [ ] Depois de escolher WiFi, clicar em "Iniciar Criação de Rota"
- [ ] Mensagem "Obrigado por ajudar!" aparece
- [ ] Card verde "Criando Rota" aparece
- [ ] Contador de tempo começa
- [ ] Contador de pontos aumenta
- [ ] Mapa aparece mostrando sua localização

**Verificar no Neon:**
```sql
SELECT COUNT(*) FROM user_tracks WHERE session_id LIKE 'session_%';
```
- Deve ter pontos GPS sendo salvos

---

### Teste 4: Marcar Pontos de Ônibus
- [ ] Durante criação de rota, clicar em "Marcar Ponto de Ônibus Aqui"
- [ ] Mensagem "📍 Ponto de ônibus marcado!" aparece
- [ ] Marcar 2-3 pontos diferentes

**Verificar no Neon:**
```sql
SELECT * FROM temp_stops ORDER BY created_at DESC LIMIT 5;
```
- Deve ter as coordenadas dos pontos marcados

---

### Teste 5: Finalizar Rota
- [ ] Clicar em "Finalizar e Salvar Rota"
- [ ] Mensagem "Rota salva! X pontos coletados" aparece
- [ ] Card verde desaparece
- [ ] Botão volta para "Iniciar Criação de Rota"

---

### Teste 6: Mapa - Tooltip e Avatar
- [ ] Ir para página "Home"
- [ ] Mapa deve carregar
- [ ] Ícones de ônibus devem aparecer
- [ ] Tocar em um ônibus
- [ ] Tooltip deve mostrar APENAS o ID (ex: "001")
- [ ] Não deve mostrar descrição completa
- [ ] Seu avatar deve aparecer no mapa
- [ ] Tocar no seu avatar
- [ ] Tooltip deve mostrar "Eu"

---

### Teste 7: Controles de Zoom
- [ ] No mapa, procurar botões + e - no canto inferior direito
- [ ] Clicar em + para dar zoom in
- [ ] Clicar em - para dar zoom out
- [ ] Fazer pinça com os dedos (zoom in/out)
- [ ] Dar dois toques rápidos (zoom in)
- [ ] Verificar que o zoom funciona normalmente

---

### Teste 8: Ranking
- [ ] Ir para página "Contribuir"
- [ ] Clicar no card "Ver Ranking"
- [ ] Página deve abrir (NÃO deve dar tela branca)
- [ ] Tabela com colunas: #, Usuário, Nv, Pts, Viag, GPS
- [ ] Seu nickname deve aparecer na lista
- [ ] Clicar no botão ℹ️ para ver legenda
- [ ] Legenda deve explicar as colunas

---

## 🌐 Testes no Browser/PWA

### Teste 1: Não Mostrar Card WiFi
- [ ] Abrir https://tarifazero.vercel.app no navegador
- [ ] Ir para "Contribuir"
- [ ] Selecionar uma linha
- [ ] Card WiFi NÃO deve aparecer
- [ ] Botão "Iniciar Criação de Rota" deve estar habilitado
- [ ] Não deve pedir para escolher WiFi

---

### Teste 2: Criação de Rota sem WiFi
- [ ] Clicar em "Iniciar Criação de Rota"
- [ ] Permitir acesso à localização
- [ ] Criação de rota deve iniciar normalmente
- [ ] Marcar pontos de ônibus deve funcionar
- [ ] Finalizar rota deve funcionar

---

### Teste 3: Ranking no Browser
- [ ] Ir para "Contribuir"
- [ ] Clicar em "Ver Ranking"
- [ ] Página deve abrir sem tela branca
- [ ] Tabela deve aparecer
- [ ] Usuários devem aparecer com nicknames

---

### Teste 4: PWA - Instalação
- [ ] No Chrome/Edge, clicar no ícone de instalação
- [ ] Instalar o PWA
- [ ] Ícone deve aparecer na tela inicial
- [ ] Abrir o PWA
- [ ] Deve funcionar como app nativo
- [ ] Mas sem acesso ao WiFi Scanner

---

## 🐛 Problemas Comuns e Soluções

### WiFi Scanner não detecta redes
**Causa:** Permissões não concedidas
**Solução:**
1. Ir em Configurações do Android
2. Apps → Tarifa Zero → Permissões
3. Ativar "Localização" (Sempre permitir)
4. Ativar "WiFi"

### Ranking dá tela branca
**Causa:** Migração não foi aplicada
**Solução:** Aplicar migração no Neon (ver início deste guia)

### Marcar paradas não funciona
**Causa:** Tabela TempStop não existe
**Solução:** Aplicar migração no Neon

### Nickname não aparece no banco
**Causa:** Endpoint /api/users/create não está funcionando
**Solução:** Verificar logs do Vercel

### Mapa não carrega
**Causa:** API do Vercel está offline
**Solução:** Verificar status do deploy no Vercel

---

## 📊 Verificações no Banco de Dados

Depois de todos os testes, verificar no Neon:

```sql
-- Usuários criados
SELECT anonymous_id, nickname, points, level, total_trips 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- WiFi salvos
SELECT w.ssid, w.bssid, l.code, l.name 
FROM wifi_networks w 
JOIN lines l ON w.line_id = l.id 
ORDER BY w.created_at DESC 
LIMIT 10;

-- Pontos GPS coletados
SELECT COUNT(*) as total_pontos, line_id 
FROM user_tracks 
GROUP BY line_id;

-- Paradas marcadas
SELECT COUNT(*) as total_paradas, line_id 
FROM temp_stops 
GROUP BY line_id;
```

---

## ✅ Checklist Final

### Backend
- [ ] Migração aplicada no Neon
- [ ] Deploy no Vercel completo
- [ ] API respondendo (testar https://tarifazero.vercel.app/api)

### APK
- [ ] WiFi Scanner funciona
- [ ] Nickname salvo no banco
- [ ] Criação de rota funciona
- [ ] Marcar paradas funciona
- [ ] Ranking abre sem erro
- [ ] Tooltip mostra só ID
- [ ] Avatar mostra "Eu"
- [ ] Zoom funciona

### Browser/PWA
- [ ] Card WiFi não aparece
- [ ] Criação de rota funciona
- [ ] Ranking abre sem erro
- [ ] PWA pode ser instalado

---

## 📝 Reportar Problemas

Se encontrar algum problema, anote:
1. O que você estava fazendo
2. O que esperava que acontecesse
3. O que realmente aconteceu
4. Mensagem de erro (se houver)
5. Screenshot (se possível)
6. Logs do console (F12 no browser ou adb logcat no Android)
