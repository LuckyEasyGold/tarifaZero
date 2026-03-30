# 📱 APK Gerado - TarifaZero.apk

## ✅ APK Pronto!

**Nome:** `TarifaZero.apk`

**Localização:** `C:\projetos\tarifaZero\TarifaZero.apk`

**Tamanho:** 10.4 MB (10,410,136 bytes)

**Data:** 30/03/2026 16:50

---

## 🎯 O que tem neste APK

### Correções Implementadas
- ✅ Scan automático de WiFi ao selecionar linha
- ✅ Botão manual "Escanear Redes Wi-Fi" (roxo)
- ✅ Card WiFi com 3 estados (escaneando, redes, vazio)
- ✅ Mensagens de erro claras
- ✅ Botão "Tentar Novamente" quando não detectar redes
- ✅ Indicador verde quando WiFi for selecionado
- ✅ Nickname salvo no banco de dados
- ✅ Ranking em formato de tabela
- ✅ Tooltip dos ônibus mostra só ID
- ✅ Avatar mostra "Eu"
- ✅ Controles de zoom visíveis
- ✅ Marcar pontos de ônibus durante criação de rota

---

## 📲 Como Instalar

### Opção 1: Via Cabo USB
1. Conectar celular no computador
2. Copiar `TarifaZero.apk` para o celular
3. No celular, abrir o arquivo
4. Permitir instalação de fontes desconhecidas (se necessário)
5. Instalar

### Opção 2: Via Email/WhatsApp
1. Enviar `TarifaZero.apk` para seu email/WhatsApp
2. Abrir no celular
3. Baixar o arquivo
4. Abrir e instalar

### Opção 3: Via Google Drive/Dropbox
1. Fazer upload do `TarifaZero.apk`
2. Abrir link no celular
3. Baixar e instalar

---

## 🧪 Testes a Fazer

### 1. Primeira Abertura
- [ ] Splash screen aparece
- [ ] Tela de boas-vindas aparece
- [ ] Digitar nickname "João"
- [ ] Aceitar termos
- [ ] App abre na Home

### 2. WiFi Scanner (PRINCIPAL)
- [ ] Ir em "Contribuir"
- [ ] Selecionar linha "L001"
- [ ] Aguardar 1-2 segundos
- [ ] **Card WiFi aparece automaticamente?**
- [ ] Se não, clicar no botão roxo "Escanear Redes Wi-Fi"
- [ ] Card mostra redes detectadas?
- [ ] Clicar em uma rede
- [ ] Mensagem "Wi-Fi salvo" aparece?
- [ ] Indicador verde aparece?
- [ ] Botão "Iniciar" fica habilitado?

### 3. Criar Rota
- [ ] Clicar em "Iniciar Criação de Rota"
- [ ] Card verde aparece?
- [ ] Contador de tempo funciona?
- [ ] Contador de pontos aumenta?
- [ ] Mapa aparece?

### 4. Marcar Paradas
- [ ] Durante criação, clicar em "Marcar Ponto de Ônibus Aqui"
- [ ] Mensagem "📍 Ponto marcado" aparece?

### 5. Finalizar Rota
- [ ] Clicar em "Finalizar e Salvar Rota"
- [ ] Mensagem "Rota salva! X pontos" aparece?

### 6. Mapa
- [ ] Ir em "Home"
- [ ] Tooltip dos ônibus mostra só ID?
- [ ] Seu avatar mostra "Eu"?
- [ ] Botões +/- aparecem?
- [ ] Zoom funciona?

### 7. Ranking
- [ ] Ir em "Contribuir" → "Ver Ranking"
- [ ] Página abre sem tela branca?
- [ ] Tabela aparece?
- [ ] Seu nickname "João" aparece?

---

## 🐛 Se Algo Não Funcionar

### WiFi Scanner não detecta redes

**Causa 1: Permissões**
```
Configurações → Apps → Tarifa Zero → Permissões
- Localização: Sempre permitir ✅
- WiFi: Permitir ✅
```

**Causa 2: WiFi desligado**
- Ligar WiFi do celular

**Causa 3: Nenhuma rede por perto**
- Ir para um local com redes WiFi
- Clicar em "Tentar Novamente"

**Solução:** Clicar no botão roxo "Escanear Redes Wi-Fi"

### Card WiFi não aparece

**Solução:**
1. Verificar se selecionou uma linha
2. Clicar no botão roxo "Escanear Redes Wi-Fi"
3. Aguardar 2-3 segundos

### Ranking dá tela branca

**Causa:** Problema no backend
**Solução:** Verificar se o deploy do Vercel está completo

### Marcar paradas não funciona

**Causa:** Sem permissão de localização
**Solução:** Permitir localização sempre

---

## 📊 Verificar no Banco de Dados

Depois dos testes, verificar no Neon:

```sql
-- Ver seu usuário
SELECT anonymous_id, nickname, points, level 
FROM users 
WHERE nickname = 'João';

-- Ver WiFi salvos
SELECT w.ssid, w.bssid, l.name 
FROM wifi_networks w 
JOIN lines l ON w.line_id = l.id 
ORDER BY w.created_at DESC 
LIMIT 5;

-- Ver paradas marcadas
SELECT COUNT(*) as total 
FROM temp_stops;

-- Ver pontos GPS coletados
SELECT COUNT(*) as total 
FROM user_tracks;
```

---

## 🎯 Resultado Esperado

Depois de todos os testes:

✅ WiFi Scanner funciona (automático ou manual)
✅ Card WiFi aparece
✅ Redes são detectadas
✅ WiFi é salvo no banco
✅ Criação de rota funciona
✅ Marcar paradas funciona
✅ Ranking abre sem erro
✅ Mapa funciona perfeitamente

---

## 📝 Reportar Resultados

Depois de testar, me diga:

1. ✅ O que funcionou
2. ❌ O que não funcionou
3. 📸 Screenshots (se possível)
4. 🐛 Erros encontrados

---

## 🔄 Gerar Novo APK

Se precisar gerar um novo APK no futuro:

```bash
# 1. Fazer mudanças no código
# 2. Build
npm run build

# 3. Sync com Android
npx cap sync android

# 4. Gerar APK
cd android
.\gradlew clean assembleDebug

# 5. Copiar e renomear
cd ..
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "TarifaZero.apk" -Force
```

---

## 📞 Suporte

Se tiver problemas:
1. Verificar permissões
2. Verificar WiFi ligado
3. Tentar scan manual
4. Ver logs: `adb logcat | grep -i wifi`
5. Me reportar com detalhes

Bons testes! 🚀
