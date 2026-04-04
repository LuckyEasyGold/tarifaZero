# 🤖 MCP Task: Correção de Congelamento na Atualização e Tela Branca (Capacitor + Android)

## 📋 Resumo Executivo
Projeto: TarifaZero (Capacitor + Android)
Problema 1: Quando uma nova versão é detectada, o app baixa o APK e tenta instalar, mas trava/congela no processo.
Problema 2: Após desinstalar e instalar manualmente a nova versão, o app abre com tela branca (erro de cache do WebView). Ao sair e reabrir, funciona normalmente.
Objetivo: Implementar um fluxo de atualização nativo seguro que (1) não trave o app durante a instalação, (2) limpe o cache do WebView na inicialização para evitar tela branca, e (3) gerencie corretamente o ciclo de vida das Activities no Android.

## 🗂️ Diagnóstico Técnico
| Sintoma | Causa Raiz | Solução |
|---------|-----------|---------|
| App trava ao instalar APK | Activity permanece em foreground enquanto o Intent.ACTION_INSTALL_PACKAGE é disparado. Conflito de ciclo de vida causa ANR ou estado inconsistente. | Usar finishAndRemoveTask() após disparar o instalador, garantindo saída limpa. |
| Tela branca na nova versão | WebView mantém cache HTTP de assets JS/CSS da versão anterior. Hashes mudam, o bundle quebra silenciosamente e o React não hidrata. | Executar webView.clearCache(true) no onCreate() do MainActivity. |
| Precisa sair e abrir de novo | Stack de Activities empilhado pelo instalador. Android retorna à Activity morta em vez de reiniciar. | Configurar launchMode="singleTask" e clearTaskOnLaunch="true" no AndroidManifest. |

## 🎯 TAREFAS EM ORDEM DE EXECUÇÃO (Não pule etapas)

### 🔴 TAREFA 1: Criar Plugin Nativo de Instalação de APK
Arquivo: android/app/src/main/java/com/seupacote/AppUpdaterPlugin.kt
Objetivo: Substituir a lógica atual de instalação por um Intent nativo seguro que respeita permissões Android 8+ e fecha o app corretamente.

Passo 1.1: Criar/Atualizar o arquivo Kotlin
// ATENÇÃO: Substitua "com.seupacote" pelo packageId real do projeto (ex: com.tarifazero.app)
package com.seupacote

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "AppUpdater")
class AppUpdaterPlugin : Plugin() {

    @PluginMethod
    fun installApk(call: PluginCall) {
        val uriString = call.getString("uri") ?: run {
            call.reject("URI do APK não fornecida")
            return
        }

        try {
            val uri = Uri.parse(uriString)
            val intent = Intent(Intent.ACTION_INSTALL_PACKAGE).apply {
                data = uri
                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    putExtra(Intent.EXTRA_RETURN_RESULT, true)
                }
                putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
            }

            // Verificar permissão de instalação de fontes desconhecidas (Android 8+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val canInstall = bridge?.activity?.packageManager?.canRequestPackageInstalls()
                if (canInstall != true) {
                    val settingsIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${bridge?.context?.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    bridge?.activity?.startActivity(settingsIntent)
                    call.resolve(JSObject().put("status", "permission_required").put("uri", uriString))
                    return
                }
            }

            // Disparar instalador
            bridge?.activity?.startActivity(intent)
            
            // Fechar a Activity do app imediatamente para evitar congelamento
            bridge?.activity?.finishAndRemoveTask()
            
            call.resolve(JSObject().put("status", "install_triggered"))
        } catch (e: Exception) {
            call.reject("Falha ao iniciar instalação: ${e.message}")
        }
    }
}

Passo 1.2: Registrar plugin no capacitor.config.ts (se ainda não estiver)
plugins: {
  // ... outras configs
  AppUpdater: {}
}

### 🟡 TAREFA 2: Configurar FileProvider para Caminhos de APK
Arquivo: android/app/src/main/AndroidManifest.xml
Objetivo: Permitir que o instalador do Android acesse o APK baixado pelo app sem violar regras de segurança.

Passo 2.1: Adicionar <provider> dentro da tag <application>
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>

Arquivo: android/app/src/main/res/xml/file_paths.xml (crie se não existir)
<?xml version="1.0" encoding="utf-8"?>
<paths>
    <external-path name="external_files" path="." />
    <cache-path name="cache" path="." />
    <files-path name="internal_files" path="." />
</paths>

Permissão necessária no AndroidManifest (dentro de <manifest>):
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />

### 🟡 TAREFA 3: Corrigir Tela Branca (Limpeza de Cache WebView)
Arquivo: android/app/src/main/java/com/seupacote/MainActivity.kt
Objetivo: Limpar cache HTTP do WebView na inicialização para forçar carregamento dos novos assets JS/CSS.

Passo 3.1: Modificar onCreate()
// ATENÇÃO: Mantenha os imports existentes. Adicione apenas o que falta.
package com.seupacote

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Limpa cache HTTP do WebView (JS, CSS, imagens). 
        // NÃO apaga localStorage, IndexedDB ou cookies de sessão.
        webView?.clearCache(true)
        webView?.clearHistory()
    }
}

### 🟢 TAREFA 4: Ajustar AndroidManifest (Launch Modes)
Arquivo: android/app/src/main/AndroidManifest.xml
Objetivo: Evitar empilhamento de Activities e garantir reinício limpo após voltar do instalador.

Passo 4.1: Localizar a tag <activity> principal (geralmente .MainActivity) e ajustar atributos:
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:clearTaskOnLaunch="true"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
    android:theme="@style/AppTheme.NoActionBar"
    android:exported="true">
    
    <!-- Mantenha o intent-filter original intacto -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>

### 🔵 TAREFA 5: Integrar no Frontend (TypeScript)
Arquivo: src/services/updateService.ts (ou equivalente)
Objetivo: Disparar a instalação corretamente e adicionar fallback de segurança para tela branca.

Passo 5.1: Criar/Atualizar serviço de atualização
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const installApk = async (apkPath: string): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') {
    console.warn('Instalação de APK suportada apenas no Android');
    return;
  }

  // Normalizar URI
  const uri = apkPath.startsWith('file://') ? apkPath : `file://${apkPath}`;

  try {
    await Capacitor.Plugins.AppUpdater?.installApk({ uri });
  } catch (error) {
    console.error('[Update] Falha ao disparar instalador:', error);
    throw new Error('Não foi possível iniciar a atualização automática.');
  }
};

Passo 5.2: Adicionar fallback de segurança em App.tsx (ou layout principal)
useEffect(() => {
  // Detecta tela branca prolongada (React não hidrata em 5s)
  const timer = setTimeout(() => {
    const root = document.getElementById('root') || document.getElementById('app');
    if (root && root.children.length === 0 && !document.querySelector('.hydrated')) {
      console.warn('[Fallback] Hidratação lenta/falha detectada. Recarregando WebView...');
      window.location.reload();
    }
  }, 5000);

  return () => clearTimeout(timer);
}, []);

## ✅ CRITÉRIOS DE ACEITE (Definition of Done)
Marque cada item ao implementar:
- [ ] AppUpdaterPlugin.kt criado com packageId correto e anotado com @CapacitorPlugin
- [ ] file_paths.xml criado e registrado no AndroidManifest.xml dentro de <application>
- [ ] Permissão REQUEST_INSTALL_PACKAGES adicionada ao <manifest>
- [ ] MainActivity.kt chama webView?.clearCache(true) e webView?.clearHistory() no onCreate
- [ ] <activity> configurado com launchMode="singleTask" e clearTaskOnLaunch="true"
- [ ] Frontend chama Capacitor.Plugins.AppUpdater.installApk() com URI válida
- [ ] Teste 1: Forçar update → app baixa → abre instalador nativo → app fecha sozinho → instala → abre → SEM tela branca
- [ ] Teste 2: Dados de login/sessão mantidos após atualização (clearCache não afeta localStorage)
- [ ] npx cap sync android executa sem erros
- [ ] ./gradlew assembleDebug compila com sucesso

## 🐛 DEBUG & ROLLBACK
Comandos úteis para diagnóstico:
adb logcat | grep -E "(MainActivity|AppUpdater|PackageInstaller|WebView)"
adb shell dumpsys package com.seupacote | grep -i install
npx cap sync android && npx cap open android

Rollback rápido:
git stash push -u -m "before-update-fix-$(date +%Y%m%d)"
git stash pop  # para restaurar
git checkout HEAD -- android/app/src/main/AndroidManifest.xml  # arquivo específico

Logs estratégicos para adicionar temporariamente:
console.log('[Update] URI APK:', uri); // antes de chamar installApk
console.log('[Android] WebView cache cleared'); // após clearCache no Kotlin

## 📦 DEPENDÊNCIAS E NOTAS
- Não requer novas dependências npm se já usar @capacitor/core e @capacitor/filesystem
- clearCache(true) remove APENAS cache HTTP (assets). Dados do app (login, rotas salvas, preferências) permanecem intactos.
- Em Android 11+, o sistema pode exigir confirmação do usuário na primeira instalação. O plugin já redireciona para configurações se necessário.
- Se o app usar CodePush ou Live Updates do Ionic/Capacitor, adicione window.Capacitor?.WebView?.setServerBasePath?.('/public') após clearCache.

## 🎯 INSTRUÇÃO FINAL PARA O AGENTE MCP
Você é um engenheiro mobile sênior especialista em Capacitor + Android. Sua missão é implementar as 5 tarefas deste arquivo na ordem exata.
Regras obrigatórias:
1. Substitua "com.seupacote" pelo packageId real encontrado em android/app/src/main/AndroidManifest.xml
2. Após modificar arquivos Kotlin/XML, execute npx cap sync android e confirme que não há erros de sync
3. Mantenha a lógica existente do download de APK. Apenas substitua a etapa final de instalação pela chamada ao novo plugin
4. clearCache(true) DEVE ser chamado ANTES de qualquer loadUrl ou inicialização do bridge
5. Se o projeto usar estrutura diferente (ex: src/android em vez de android/), adapte os caminhos mantendo a lógica
6. Ao finalizar cada tarefa, liste os arquivos modificados e os comandos exatos para testar
Comece agora pela Tarefa 1. Confirme a conclusão de cada etapa antes de prosseguir.