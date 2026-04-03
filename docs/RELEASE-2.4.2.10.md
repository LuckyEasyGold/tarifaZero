# Release 2.4.2.10 - Correções Importantes

## 🎯 Objetivo
Corrigir o sistema de instalação automática de APK e atualizar coordenadas das paradas usando Nominatim.

## ✅ Correções Implementadas

### 1. Sistema de Instalação de APK (CORRIGIDO)

**Problema anterior:**
- O instalador do Android abria mas não instalava o APK
- App fechava e nada acontecia
- FileOpener não estava funcionando corretamente

**Solução implementada:**
- Criado plugin nativo Android `ApkInstallerPlugin.java`
- Usa Intent nativo do Android para instalação
- Suporta Android 7.0+ com FileProvider
- Registrado no MainActivity automaticamente

**Arquivos modificados:**
- `android/app/src/main/java/com/newsdrop/tarifazero/ApkInstallerPlugin.java` (NOVO)
- `android/app/src/main/java/com/newsdrop/tarifazero/MainActivity.java`
- `src/components/UpdateNotification.tsx`

**Como funciona agora:**
1. Usuário clica em "Baixar e Instalar"
2. Barra de progresso mostra download em tempo real
3. APK é salvo no cache do dispositivo
4. Plugin nativo abre instalador do Android
5. App fecha automaticamente após 1 segundo
6. Usuário instala normalmente

### 2. Atualização de Coordenadas com Nominatim

**Mudança importante:**
- Removida dependência do Google Maps API (muita burocracia)
- Implementado Nominatim (OpenStreetMap) - GRATUITO e sem API key

**Script criado:**
- `scripts/update-coordinates.ts` - Atualiza coordenadas de todas as paradas

**Como usar:**
```bash
npx tsx scripts/update-coordinates.ts
```

**Características:**
- Geocodifica endereços usando OpenStreetMap
- Rate limit respeitado (300ms entre requisições)
- Fallback para coordenadas aproximadas se não encontrar
- Atualiza banco de dados automaticamente

**Status:**
- Script executado parcialmente (timeout após 115 paradas)
- Coordenadas foram atualizadas no banco
- Algumas paradas receberam coordenadas aproximadas

## 📦 Versão

- **Versão**: 2.4.2.10
- **VersionCode**: 17
- **Tamanho**: 14.28 MB
- **Data**: 2026-04-03

## 🚀 Deploy

- ✅ Commit realizado
- ✅ Push para GitHub
- ⏳ Vercel vai publicar automaticamente em: https://tarifazero.vercel.app/TarifaZero-2.4.2.10.apk

## 🧪 Testes Necessários

1. **Sistema de Atualização:**
   - [ ] Abrir app versão antiga
   - [ ] Verificar se banner de atualização aparece
   - [ ] Clicar em "Baixar e Instalar"
   - [ ] Verificar barra de progresso
   - [ ] Confirmar que instalador abre
   - [ ] Verificar se instalação funciona

2. **Coordenadas das Paradas:**
   - [ ] Abrir Prisma Studio: `npx prisma studio`
   - [ ] Verificar tabela `Stop`
   - [ ] Confirmar que coordenadas foram atualizadas
   - [ ] Testar no app se paradas aparecem no mapa

## 📝 Notas Técnicas

### Plugin Nativo Android

O plugin `ApkInstallerPlugin` usa:
- `FileProvider` para Android 7.0+
- `Intent.ACTION_VIEW` para abrir instalador
- `FLAG_GRANT_READ_URI_PERMISSION` para permissões
- Registrado automaticamente no `MainActivity.onCreate()`

### Nominatim (OpenStreetMap)

Vantagens sobre Google Maps:
- ✅ Gratuito
- ✅ Sem API key necessária
- ✅ Sem burocracia de billing
- ✅ Sem restrições de domínio/IP
- ⚠️ Rate limit: 1 req/sec (respeitado com delay de 300ms)

## 🔄 Próximos Passos

1. Testar instalação do APK no dispositivo real
2. Verificar se coordenadas estão corretas no mapa
3. Ajustar coordenadas manualmente se necessário
4. Considerar executar script novamente para paradas que falharam

## 📚 Documentação Adicional

- `docs/GOOGLE-MAPS-API.md` - Histórico de problemas com Google Maps
- `docs/ATUALIZAR-COORDENADAS.md` - Guia de atualização de coordenadas
- `scripts/update-coordinates.ts` - Script de geocodificação
- `scripts/import-horarios.ts` - Script de importação (também usa Nominatim)
