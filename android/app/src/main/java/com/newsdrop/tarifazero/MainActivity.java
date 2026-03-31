package com.newsdrop.tarifazero;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "MainActivity onCreate - Registrando WifiScannerPlugin");
        
        // Registrar plugin customizado (agora no mesmo package)
        try {
            registerPlugin(WifiScannerPlugin.class);
            Log.d(TAG, "WifiScannerPlugin registrado com sucesso!");
        } catch (Exception e) {
            Log.e(TAG, "ERRO ao registrar WifiScannerPlugin: " + e.getMessage(), e);
        }
    }
}
