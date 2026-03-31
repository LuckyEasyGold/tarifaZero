package com.newsdrop.tarifazero;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.widget.Toast;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.List;

@CapacitorPlugin(
    name = "WifiScanner",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location"),
        @Permission(strings = { Manifest.permission.ACCESS_WIFI_STATE }, alias = "wifiState"),
        @Permission(strings = { Manifest.permission.CHANGE_WIFI_STATE }, alias = "wifiChange"),
        // Android 13+ (API 33+)
        @Permission(strings = { "android.permission.NEARBY_WIFI_DEVICES" }, alias = "nearbyWifi")
    }
)
public class WifiScannerPlugin extends Plugin {
    private static final String TAG = "WifiScanner";
    private WifiManager wifiManager;
    private BroadcastReceiver wifiScanReceiver;

    private void showToast(final String message) {
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(getContext(), message, Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override
    public void load() {
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== PLUGIN LOAD START ===");
        android.util.Log.d(TAG, "========================================");
        
        try {
            Context context = getContext();
            
            if (context != null) {
                Context appContext = context.getApplicationContext();
                wifiManager = (WifiManager) appContext.getSystemService(Context.WIFI_SERVICE);
                
                if (wifiManager != null) {
                    android.util.Log.d(TAG, "=== PLUGIN LOADED SUCCESSFULLY ===");
                    showToast("✅ WiFi Scanner carregado!");
                } else {
                    android.util.Log.e(TAG, "=== WIFIMANAGER NULL ===");
                    showToast("❌ WifiManager NULL!");
                }
            } else {
                android.util.Log.e(TAG, "=== CONTEXT NULL ===");
                showToast("❌ Context NULL!");
            }
        } catch (Exception e) {
            android.util.Log.e(TAG, "=== PLUGIN LOAD FAILED ===");
            android.util.Log.e(TAG, "Error: " + e.getMessage(), e);
            showToast("❌ Erro ao carregar: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scan(PluginCall call) {
        android.util.Log.d(TAG, "=== SCAN METHOD CALLED ===");
        showToast("🔍 Scan iniciado - Android " + Build.VERSION.SDK_INT);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            android.util.Log.d(TAG, "Android 13+ detectado");
            
            com.getcapacitor.PermissionState state = getPermissionState("nearbyWifi");
            android.util.Log.d(TAG, "Permission State: " + state);
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.d(TAG, "Solicitando permissão NEARBY_WIFI_DEVICES");
                showToast("📱 Solicitando permissão...");
                requestPermissionForAlias("nearbyWifi", call, "permissionsCallback");
                return;
            }
            showToast("✅ Permissão OK (Android 13+)");
        } else {
            android.util.Log.d(TAG, "Android < 13 detectado");
            
            com.getcapacitor.PermissionState state = getPermissionState("location");
            android.util.Log.d(TAG, "Permission State: " + state);
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.d(TAG, "Solicitando permissão ACCESS_FINE_LOCATION");
                showToast("📍 Solicitando permissão de localização...");
                requestPermissionForAlias("location", call, "permissionsCallback");
                return;
            }
            showToast("✅ Permissão OK (Android < 13)");
        }

        performScan(call);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        android.util.Log.d(TAG, "=== PERMISSIONS CALLBACK ===");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            com.getcapacitor.PermissionState state = getPermissionState("nearbyWifi");
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.e(TAG, "Permissão NEGADA");
                showToast("❌ Permissão negada!");
                call.reject("Permissão 'Dispositivos próximos' necessária");
                return;
            }
            showToast("✅ Permissão concedida!");
        } else {
            com.getcapacitor.PermissionState state = getPermissionState("location");
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.e(TAG, "Permissão NEGADA");
                showToast("❌ Permissão de localização negada!");
                call.reject("Permissão de localização necessária");
                return;
            }
            showToast("✅ Permissão de localização concedida!");
        }
        
        performScan(call);
    }

    private void performScan(final PluginCall call) {
        android.util.Log.d(TAG, "=== PERFORM SCAN START ===");
        showToast("🔄 Iniciando scan WiFi...");
        
        if (wifiManager == null) {
            android.util.Log.e(TAG, "ERRO: WifiManager NULL!");
            showToast("❌ WifiManager NULL!");
            call.reject("Wi-Fi não disponível");
            return;
        }
        
        boolean isEnabled = wifiManager.isWifiEnabled();
        android.util.Log.d(TAG, "WiFi Enabled: " + isEnabled);

        if (!isEnabled) {
            android.util.Log.w(TAG, "WiFi DESABILITADO");
            showToast("⚠️ WiFi desligado! Ligando...");
            call.reject("Wi-Fi está desligado");
            return;
        }
        
        showToast("📡 WiFi ligado, escaneando...");

        // Registrar receiver
        wifiScanReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                android.util.Log.d(TAG, "=== BROADCAST RECEIVER TRIGGERED ===");
                showToast("📨 Resultado recebido!");
                
                try {
                    context.unregisterReceiver(this);
                } catch (Exception e) {
                    android.util.Log.e(TAG, "Erro ao desregistrar: " + e.getMessage());
                }

                List<ScanResult> results = wifiManager.getScanResults();
                
                if (results != null && !results.isEmpty()) {
                    android.util.Log.d(TAG, "Scan SUCESSO! " + results.size() + " redes");
                    showToast("✅ " + results.size() + " redes encontradas!");
                    resolveNetworks(call, results);
                } else {
                    android.util.Log.w(TAG, "Nenhuma rede encontrada");
                    showToast("⚠️ Nenhuma rede encontrada");
                    call.reject("Nenhuma rede Wi-Fi encontrada");
                }
            }
        };

        IntentFilter intentFilter = new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
        
        try {
            getContext().registerReceiver(wifiScanReceiver, intentFilter);
            android.util.Log.d(TAG, "BroadcastReceiver REGISTRADO");
            showToast("✅ Receiver registrado");
        } catch (Exception e) {
            android.util.Log.e(TAG, "ERRO ao registrar: " + e.getMessage());
            showToast("❌ Erro ao registrar receiver");
            call.reject("Erro ao configurar scanner");
            return;
        }

        boolean started = wifiManager.startScan();
        android.util.Log.d(TAG, "startScan() = " + started);
        
        if (!started) {
            android.util.Log.w(TAG, "startScan() = FALSE");
            showToast("⚠️ startScan() retornou FALSE");
            
            try {
                getContext().unregisterReceiver(wifiScanReceiver);
            } catch (Exception e) {}

            List<ScanResult> cached = wifiManager.getScanResults();
            
            if (cached != null && !cached.isEmpty()) {
                showToast("📦 Usando cache: " + cached.size() + " redes");
                resolveNetworks(call, cached);
            } else {
                showToast("❌ Sem cache disponível");
                call.reject("Não foi possível iniciar scan");
            }
        } else {
            showToast("⏳ Aguardando resultado...");
        }
    }

    private void resolveNetworks(PluginCall call, List<ScanResult> results) {
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== RESOLVE NETWORKS ===");
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "Total de redes: " + results.size());
        
        JSArray networks = new JSArray();

        for (int i = 0; i < results.size(); i++) {
            ScanResult result = results.get(i);
            JSObject network = new JSObject();
            String ssid = result.SSID;
            
            network.put("ssid", (ssid != null && !ssid.isEmpty()) ? ssid : "");
            network.put("bssid", result.BSSID != null ? result.BSSID : "");
            network.put("level", result.level);
            network.put("frequency", result.frequency);
            networks.put(network);
            
            android.util.Log.d(TAG, "Rede #" + (i+1) + ": " + 
                (ssid != null && !ssid.isEmpty() ? ssid : "[SSID vazio]") + 
                " (" + result.BSSID + ") - " + result.level + " dBm @ " + result.frequency + " MHz");
        }

        JSObject ret = new JSObject();
        ret.put("networks", networks);
        
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== RETORNANDO " + networks.length() + " REDES PARA JAVASCRIPT ===");
        android.util.Log.d(TAG, "========================================");
        
        call.resolve(ret);
    }
}
