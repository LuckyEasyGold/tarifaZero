# ✅ Checklist Rápido - Tarifa Zero

## 🔴 ANTES DE TESTAR (OBRIGATÓRIO)

### 1. Aplicar Migração no Neon
```bash
cd C:\projetos\tarifaZero
npx prisma migrate dev --name add_temp_stops_and_fix_wifi
npx prisma generate
```

**OU** executar no console do Neon:
```sql
-- Criar tabela temp_stops
CREATE TABLE temp_stops (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_temp_stops_line_id ON temp_stops(line_id);

-- Corrigir wifi_networks
ALTER TABLE wifi_networks DROP CONSTRAINT IF EXISTS wifi_networks_line_id_ssid_key;
ALTER TABLE wifi_networks ALTER COLUMN ssid DROP NOT NULL;
ALTER TABLE wifi_networks ALTER COLUMN bssid SET NOT NULL;
ALTER TABLE wifi_networks ADD CONSTRAINT wifi_networks_bssid_key UNIQUE (bssid);
CREATE INDEX IF NOT EXISTS idx_wifi_networks_line_id ON wifi_networks(line_id);
```

### 2. Verificar Deploy no Vercel
- [ ] Acessar https://vercel.com/dashboard
- [ ] Projeto `tarifazero` com status "Ready"
- [ ] Último commit: "docs: adicionar resumo visual das alterações"

### 3. Gerar Novo APK
```bash
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
```
APK em: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 📱 Testes Rápidos no APK

### Teste 1: Nickname
- [ ] Abrir APK
- [ ] Digitar nickname "João"
- [ ] Aceitar termos
- [ ] Verificar no Neon: `SELECT nickname FROM users ORDER BY created_at DESC LIMIT 1;`
- [ ] Deve retornar "João"

### Teste 2: WiFi Scanner
- [ ] Ir em Contribuir
- [ ] Selecionar linha
- [ ] Card WiFi aparece?
- [ ] Lista de redes aparece?
- [ ] Clicar em uma rede
- [ ] Mensagem "Wi-Fi salvo" aparece?

### Teste 3: Marcar Paradas
- [ ] Iniciar criação de rota
- [ ] Clicar em "Marcar Ponto de Ônibus Aqui"
- [ ] Mensagem "📍 Ponto marcado" aparece?
- [ ] Verificar no Neon: `SELECT COUNT(*) FROM temp_stops;`

### Teste 4: Ranking
- [ ] Ir em Contribuir → Ver Ranking
- [ ] Página abre? (não dá tela branca?)
- [ ] Tabela aparece?
- [ ] Seu nickname aparece?

### Teste 5: Mapa
- [ ] Ir em Home
- [ ] Tooltip dos ônibus mostra só ID?
- [ ] Seu avatar mostra "Eu"?
- [ ] Botões +/- aparecem?
- [ ] Zoom funciona?

---

## 🌐 Testes Rápidos no Browser

### Teste 1: Sem Card WiFi
- [ ] Abrir https://tarifazero.vercel.app
- [ ] Ir em Contribuir
- [ ] Selecionar linha
- [ ] Card WiFi NÃO aparece?
- [ ] Botão "Iniciar" está habilitado?

### Teste 2: Ranking
- [ ] Ir em Contribuir → Ver Ranking
- [ ] Página abre sem erro?
- [ ] Tabela aparece?

---

## 🐛 Se Algo Não Funcionar

### WiFi Scanner não detecta
1. Verificar permissões do app (Localização)
2. Verificar se WiFi está ligado
3. Ver logs: `adb logcat | grep -i wifi`

### Ranking dá tela branca
1. Migração foi aplicada?
2. Verificar console do browser (F12)
3. Ver logs do Vercel

### Marcar paradas não funciona
1. Tabela temp_stops existe?
2. Verificar no Neon: `\dt temp_stops`

### Nickname não salva
1. Verificar logs do Vercel
2. Testar endpoint: `curl -X POST https://tarifazero.vercel.app/api/users/create -H "Content-Type: application/json" -d '{"anonymousId":"test123","nickname":"Teste"}'`

---

## 📊 Verificações no Neon

```sql
-- Ver usuários
SELECT anonymous_id, nickname, points FROM users ORDER BY created_at DESC LIMIT 5;

-- Ver WiFi salvos
SELECT w.ssid, w.bssid, l.name FROM wifi_networks w JOIN lines l ON w.line_id = l.id;

-- Ver paradas marcadas
SELECT COUNT(*) FROM temp_stops;

-- Ver pontos GPS
SELECT COUNT(*) FROM user_tracks;
```

---

## ✅ Tudo Funcionando?

Se todos os testes passaram:
- ✅ Migração aplicada corretamente
- ✅ Backend funcionando
- ✅ APK funcionando
- ✅ Browser/PWA funcionando

**Próximo passo:** Usar o app normalmente e reportar qualquer problema!

---

## 📞 Reportar Problemas

Se algo não funcionar, anote:
1. O que você fez
2. O que esperava
3. O que aconteceu
4. Mensagem de erro
5. Screenshot

E me envie para eu corrigir!
