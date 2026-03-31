# Correções do WiFi Scanner - 30/03/2026

## Problemas Identificados e Soluções

### 1. WiFi Scanner no APK não funcionava
**Problema**: O card de seleção de WiFi não aparecia automaticamente quando o usuário selecionava uma linha.

**Soluções aplicadas**:
- ✅ Adicionados logs detalhados no plugin Java (`WifiScannerPlugin.java`)
- ✅ Verificação se WiFi está habilitado antes de escanear
- ✅ Mensagens de erro mais específicas e amigáveis
- ✅ Melhor tratamento de permissões
- ✅ Indicador visual de scan em andamento na página Contribuir
- ✅ Tempo de espera reduzido de 1500ms para 500ms

### 2. Nome do APK
**Problema**: APK era gerado com nome padrão `app-debug.apk`

**Solução aplicada**:
- ✅ Configurado `build.gradle` para gerar APK com nome `TarifaZero.apk`
- ✅ APK copiado para raiz do projeto e pasta `public/`

### 3. Feedback Visual Durante Gravação
**Status**: ✅ Já estava implementado corretamente

Funcionalidades existentes:
- Banner vermelho no topo com tempo, pontos GPS e precisão
- Botões flutuantes para marcar parada (direita) e finalizar (esquerda)
- Modal para nomear paradas com sugestões
- Caminho sendo desenhado no mapa em tempo real

### 4. Validação no Browser
**Status**: ✅ Já estava implementado corretamente

- Modal explicativo aparece quando usuário tenta contribuir pelo browser
- Explica que precisa do aplicativo Android para validar WiFi
- Link para download do APK

## Logs Adicionados

O plugin WiFi Scanner agora registra logs detalhados no logcat do Android:

```
[WifiScanner] scan() chamado
[WifiScanner] Permissões OK, iniciando scan
[WifiScanner] performScan() iniciado
[WifiScanner] WiFi está habilitado
[WifiScanner] BroadcastReceiver registrado
[WifiScanner] wifiManager.startScan() retornou: true
[WifiScanner] BroadcastReceiver.onReceive() chamado
[WifiScanner] Scan success: true
[WifiScanner] scanSuccess() chamado
[WifiScanner] Número de redes encontradas: 5
[WifiScanner] Rede: WIFI_ONIBUS (AA:BB:CC:DD:EE:FF) - -45 dBm
[WifiScanner] Retornando 5 redes
```

## Como Testar

### No APK:
1. Instale o novo APK: `TarifaZero.apk`
2. Abra o app e vá em "Contribuir"
3. Selecione uma linha
4. Observe:
   - Indicador "Escaneando redes Wi-Fi..." aparece
   - Card com redes WiFi aparece automaticamente
   - Se houver erro, mensagem específica é mostrada

### Verificar Logs (se necessário):
```bash
adb logcat | grep -i wifi
```

### Permissões Necessárias:
- Localização: **Sempre permitir** (não apenas "Enquanto usa o app")
- WiFi deve estar **ligado**

## Mensagens de Erro Amigáveis

O sistema agora mostra mensagens específicas:

- ❌ "WiFi está desabilitado. Por favor, habilite o WiFi e tente novamente."
- ❌ "Permissão de localização necessária. Vá em Configurações → Apps → Tarifa Zero → Permissões → Localização (Sempre permitir)."
- ❌ "Nenhuma rede Wi-Fi detectada. Certifique-se de que o WiFi está ligado."

## Arquivos Modificados

1. `android/app/src/main/java/com/newsdrop/tarifazero/WifiScannerPlugin.java`
   - Logs detalhados
   - Verificação de WiFi habilitado
   - Mensagens de erro específicas

2. `android/app/build.gradle`
   - Configuração de nome do APK

3. `src/hooks/useWifiScanner.ts`
   - Mensagens de erro mais amigáveis
   - Melhor tratamento de exceções

4. `src/pages/Contribuir.tsx`
   - Indicador visual de scan em andamento
   - Tempo de espera reduzido

## APK Gerado

- **Nome**: `TarifaZero.apk`
- **Localização**: 
  - Raiz do projeto: `TarifaZero.apk`
  - Pasta public: `public/TarifaZero.apk`
  - Build: `android/app/build/outputs/apk/debug/TarifaZero.apk`
- **Tamanho**: ~10.4 MB
- **Data**: 30/03/2026 18:30
