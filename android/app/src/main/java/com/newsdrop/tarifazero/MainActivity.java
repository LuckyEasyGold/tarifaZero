package com.newsdrop.tarifazero;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Limpa cache HTTP do WebView (JS, CSS, imagens)
        // NÃO apaga localStorage, IndexedDB ou cookies de sessão
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().clearCache(true);
            bridge.getWebView().clearHistory();
        }
        
        // Registrar plugins customizados
        registerPlugin(ApkInstallerPlugin.class);
        registerPlugin(AppUpdaterPlugin.class);
    }
}
