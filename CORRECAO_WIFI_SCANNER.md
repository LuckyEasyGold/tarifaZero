# ✅ Correção do WiFi Scanner

## 🐛 Problema Identificado

No APK, ao selecionar uma linha, o card de WiFi não aparecia automaticamente.

## 🔧 Correções Aplicadas

### 1. Scan Automático ao Selecionar Linha
Agora quando você seleciona uma linha no APK:
- ✅ WiFi Scanner faz scan automaticamente
- ✅ Card aparece após 1.5 segundos
- ✅ Mostra as redes detectadas

### 2. Botão Manual de Scan
Adicionado botão "Escanear Redes Wi-Fi":
- ✅ Aparece entre a seleção de linha e o botão "Iniciar"
- ✅ Cor roxa para destacar
- ✅ Permite escanear manualmente se o automático falhar
- ✅ Mostra "Escaneando..." durante o scan

### 3. Card de WiFi Melhorado
O card agora mostra 3 estados:

**Estado 1: Escaneando**
```
┌─────────────────────────────────┐
│ 📶 Escolha o Wi-Fi do Ônibus    │
│                                 │
│     [spinner animado]           │
│   Escaneando redes Wi-Fi...     │
└─────────────────────────────────┘
```

**Estado 2: Redes Encontradas**
```
┌─────────────────────────────────┐
│ 📶 Escolha o Wi-Fi do Ônibus    │
│                                 │
│ Selecione a rede Wi-Fi do       │
│ ônibus para ajudar a            │
│ identificar esta linha:         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📶 WIFI_ONIBUS_001          │ │
│ │    AA:BB:CC:DD:EE:FF        │ │
│ │                    -45 dBm  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 📶 WIFI_ONIBUS_002          │ │
│ │    11:22:33:44:55:66        │ │
│ │                    -52 dBm  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Fechar]                        │
└─────────────────────────────────┘
```

**Estado 3: Nenhuma Rede Detectada**
```
┌─────────────────────────────────┐
│ 📶 Escolha o Wi-Fi do Ônibus    │
│                                 │
│     [ícone WiFi grande]         │
│ Nenhuma rede Wi-Fi detectada    │
│                                 │
│   [Tentar Novamente]            │
└─────────────────────────────────┘
```

### 4. Mensagens de Erro
Se houver erro no scan:
```
┌─────────────────────────────────┐
│ ⚠️ Erro ao escanear redes Wi-Fi │
│ Verifique as permissões         │
└─────────────────────────────────┘
```

## 📱 Novo Fluxo no APK

```
1. Abrir página Contribuir
   ↓
2. Selecionar linha (ex: "L001")
   ↓
3. WiFi Scanner faz scan automático
   ↓
4. Após 1.5s, card aparece
   ↓
5. Se não aparecer, clicar em "Escanear Redes Wi-Fi"
   ↓
6. Card mostra redes detectadas
   ↓
7. Clicar em uma rede
   ↓
8. Mensagem "Wi-Fi salvo" aparece
   ↓
9. Card fecha
   ↓
10. Botão "Iniciar Criação de Rota" fica habilitado
```

## 🧪 Como Testar

### Teste 1: Scan Automático
1. Abrir APK
2. Ir em "Contribuir"
3. Selecionar linha "L001"
4. Aguardar 1-2 segundos
5. **Verificar:** Card WiFi aparece automaticamente

### Teste 2: Scan Manual
1. Se o card não aparecer automaticamente
2. Clicar no botão roxo "Escanear Redes Wi-Fi"
3. **Verificar:** Card aparece com redes ou mensagem de erro

### Teste 3: Selecionar WiFi
1. No card, clicar em uma rede
2. **Verificar:** Mensagem "Obrigado! Wi-Fi salvo" aparece
3. **Verificar:** Card fecha
4. **Verificar:** Indicador verde aparece mostrando WiFi selecionado
5. **Verificar:** Botão "Iniciar Criação de Rota" fica habilitado

### Teste 4: Nenhuma Rede
1. Se não houver redes WiFi por perto
2. **Verificar:** Card mostra "Nenhuma rede detectada"
3. **Verificar:** Botão "Tentar Novamente" aparece
4. Clicar em "Tentar Novamente"
5. **Verificar:** Faz novo scan

## 🔍 Debug

Se o WiFi Scanner não funcionar, verificar:

### 1. Permissões
```
Configurações → Apps → Tarifa Zero → Permissões
- Localização: Sempre permitir ✅
- WiFi: Permitir ✅
```

### 2. Logs do Android
```bash
adb logcat | grep -i "wifi"
```

Procurar por:
- `[WiFi Scanner] App nativo detectado`
- `[WiFi Scanner] Executando scan...`
- `[WiFi Scanner] Resultado:`
- `[WiFi Scanner] Redes encontradas:`

### 3. Verificar no Código
Abrir DevTools no Android Studio e verificar console do WebView

## 📦 Novo APK Gerado

**Localização:** `android\app\build\outputs\apk\debug\app-debug.apk`

**Tamanho:** ~10.4 MB

**Mudanças:**
- ✅ Scan automático ao selecionar linha
- ✅ Botão manual de scan
- ✅ Card com 3 estados (escaneando, redes, vazio)
- ✅ Mensagens de erro
- ✅ Botão "Tentar Novamente"

## ✅ Resultado Esperado

Agora ao selecionar uma linha no APK:
1. WiFi Scanner faz scan automaticamente
2. Card aparece após 1.5 segundos
3. Mostra redes detectadas OU mensagem de erro
4. Usuário clica em uma rede
5. WiFi é salvo no banco
6. Botão "Iniciar" fica habilitado

Se o scan automático falhar:
1. Botão roxo "Escanear Redes Wi-Fi" aparece
2. Usuário clica
3. Scan manual é executado
4. Card aparece com resultado

## 🚀 Próximo Passo

Instalar o novo APK e testar! 📱
