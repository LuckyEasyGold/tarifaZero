package com.newsdrop.tarifazero;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.os.Build;

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

    @Override
    public void load() {
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== PLUGIN LOAD START ===");
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "Class: " + this.getClass().getName());
        android.util.Log.d(TAG, "Package: " + this.getClass().getPackage().getName());
        android.util.Log.d(TAG, "ClassLoader: " + this.getClass().getClassLoader());
        
        try {
            Context context = getContext();
            android.util.Log.d(TAG, "Context: " + (context != null ? context.getClass().getName() : "NULL"));
            
            if (context != null) {
                Context appContext = context.getApplicationContext();
                android.util.Log.d(TAG, "AppContext: " + (appContext != null ? appContext.getClass().getName() : "NULL"));
                
                wifiManager = (WifiManager) appContext.getSystemService(Context.WIFI_SERVICE);
                android.util.Log.d(TAG, "WifiManager: " + (wifiManager != null ? wifiManager.getClass().getName() : "NULL"));
                
                if (wifiManager != null) {
                    android.util.Log.d(TAG, "WiFi State: " + (wifiManager.isWifiEnabled() ? "ENABLED" : "DISABLED"));
                }
            }
            
            android.util.Log.d(TAG, "========================================");
            android.util.Log.d(TAG, "=== PLUGIN LOADED SUCCESSFULLY ===");
            android.util.Log.d(TAG, "========================================");
        } catch (Exception e) {
            android.util.Log.e(TAG, "========================================");
            android.util.Log.e(TAG, "=== PLUGIN LOAD FAILED ===");
            android.util.Log.e(TAG, "========================================");
            android.util.Log.e(TAG, "Error: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void scan(PluginCall call) {
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== SCAN METHOD CALLED ===");
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "Call ID: " + call.getCallbackId());
        android.util.Log.d(TAG, "Method: scan");
        android.util.Log.d(TAG, "Thread: " + Thread.currentThread().getName());
        android.util.Log.d(TAG, "Android Version: " + Build.VERSION.SDK_INT);
        android.util.Log.d(TAG, "Android Release: " + Build.VERSION.RELEASE);
        android.util.Log.d(TAG, "Device: " + Build.MANUFACTURER + " " + Build.MODEL);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            android.util.Log.d(TAG, "Android 13+ detectado (API " + Build.VERSION.SDK_INT + ")");
            android.util.Log.d(TAG, "Verificando permissão NEARBY_WIFI_DEVICES...");
            
            com.getcapacitor.PermissionState state = getPermissionState("nearbyWifi");
            android.util.Log.d(TAG, "Permission State: " + state);
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.d(TAG, "Permissão NEARBY_WIFI_DEVICES não concedida, solicitando...");
                requestPermissionForAlias("nearbyWifi", call, "permissionsCallback");
                return;
            }
            android.util.Log.d(TAG, "Permissão NEARBY_WIFI_DEVICES OK");
        } else {
            android.util.Log.d(TAG, "Android < 13 detectado (API " + Build.VERSION.SDK_INT + ")");
            android.util.Log.d(TAG, "Verificando permissão ACCESS_FINE_LOCATION...");
            
            com.getcapacitor.PermissionState state = getPermissionState("location");
            android.util.Log.d(TAG, "Permission State: " + state);
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.d(TAG, "Permissão ACCESS_FINE_LOCATION não concedida, solicitando...");
                requestPermissionForAlias("location", call, "permissionsCallback");
                return;
            }
            android.util.Log.d(TAG, "Permissão ACCESS_FINE_LOCATION OK");
        }

        performScan(call);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== PERMISSIONS CALLBACK ===");
        android.util.Log.d(TAG, "========================================");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            com.getcapacitor.PermissionState state = getPermissionState("nearbyWifi");
            android.util.Log.d(TAG, "NEARBY_WIFI_DEVICES State: " + state);
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.e(TAG, "Permissão NEARBY_WIFI_DEVICES NEGADA pelo usuário");
                call.reject("Permissão 'Dispositivos próximos' necessária para escanear redes Wi-Fi");
                return;
            }
            android.util.Log.d(TAG, "Permissão NEARBY_WIFI_DEVICES CONCEDIDA");
        } else {
            com.getcapacitor.PermissionState state = getPermissionState("location");
            android.util.Log.d(TAG, "ACCESS_FINE_LOCATION State: " + state);
            
            if (state != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.e(TAG, "Permissão ACCESS_FINE_LOCATION NEGADA pelo usuário");
                call.reject("Permissão de localização necessária para escanear redes Wi-Fi");
                return;
            }
            android.util.Log.d(TAG, "Permissão ACCESS_FINE_LOCATION CONCEDIDA");
        }
        
        performScan(call);
    }

    private void performScan(final PluginCall call) {
        android.util.Log.d(TAG, "========================================");
        android.util.Log.d(TAG, "=== PERFORM SCAN START ===");
        android.util.Log.d(TAG, "========================================");
        
        if (wifiManager == null) {
            android.util.Log.e(TAG, "ERRO CRÍTICO: WifiManager é NULL!");
            android.util.Log.e(TAG, "Plugin não foi inicializado corretamente");
            call.reject("Wi-Fi não disponível neste dispositivo");
            return;
        }
        
        android.util.Log.d(TAG, "WifiManager OK: " + wifiManager.getClass().getName());
        
        boolean isEnabled = wifiManager.isWifiEnabled();
        android.util.Log.d(TAG, "WiFi Enabled: " + isEnabled);

        if (!isEnabled) {
            android.util.Log.w(TAG, "WiFi está DESABILITADO, tentando usar cache...");
            List<ScanResult> cached = wifiManager.getScanResults();
            android.util.Log.d(TAG, "Cache results: " + (cached != null ? cached.size() + " redes" : "NULL"));
            
            if (cached != null && !cached.isEmpty()) {
                android.util.Log.d(TAG, "Cache encontrado com " + cached.size() + " redes");
                resolveNetworks(call, cached);
                return;
            }
            android.util.Log.e(TAG, "WiFi desabilitado e sem cache disponível");
            call.reject("Wi-Fi está desligado. Ative o Wi-Fi e tente novamente.");
            return;
        }
        
        android.util.Log.d(TAG, "WiFi está HABILITADO, iniciando scan...");

        // Registrar receiver
        wifiScanReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                android.util.Log.d(TAG, "========================================");
                android.util.Log.d(TAG, "=== BROADCAST RECEIVER TRIGGERED ===");
                android.util.Log.d(TAG, "========================================");
                android.util.Log.d(TAG, "Intent Action: " + intent.getAction());
                
                try {
                    context.unregisterReceiver(this);
                    android.util.Log.d(TAG, "BroadcastReceiver desregistrado com sucesso");
                } catch (Exception e) {
                    android.util.Log.e(TAG, "Erro ao desregistrar receiver: " + e.getMessage(), e);
                }

                List<ScanResult> results = wifiManager.getScanResults();
                android.util.Log.d(TAG, "Scan Results: " + (results != null ? results.size() + " redes" : "NULL"));
                
                if (results != null && !results.isEmpty()) {
                    android.util.Log.d(TAG, "Scan SUCESSO! " + results.size() + " redes encontradas");
                    resolveNetworks(call, results);
                } else {
                    android.util.Log.w(TAG, "Scan completou mas NENHUMA rede encontrada");
                    call.reject("Nenhuma rede Wi-Fi encontrada");
                }
            }
        };

        IntentFilter intentFilter = new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
        android.util.Log.d(TAG, "IntentFilter criado: " + WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
        
        try {
            getContext().registerReceiver(wifiScanReceiver, intentFilter);
            android.util.Log.d(TAG, "BroadcastReceiver REGISTRADO com sucesso");
        } catch (Exception e) {
            android.util.Log.e(TAG, "ERRO ao registrar BroadcastReceiver: " + e.getMessage(), e);
            call.reject("Erro ao configurar scanner: " + e.getMessage());
            return;
        }

        boolean started = wifiManager.startScan();
        android.util.Log.d(TAG, "wifiManager.startScan() retornou: " + started);
        
        if (!started) {
            android.util.Log.w(TAG, "startScan() retornou FALSE, tentando usar cache...");
            try {
                getContext().unregisterReceiver(wifiScanReceiver);
                android.util.Log.d(TAG, "Receiver desregistrado após falha");
            } catch (Exception e) {
                android.util.Log.e(TAG, "Erro ao desregistrar após falha: " + e.getMessage());
            }

            List<ScanResult> cached = wifiManager.getScanResults();
            android.util.Log.d(TAG, "Tentando cache: " + (cached != null ? cached.size() + " redes" : "NULL"));
            
            if (cached != null && !cached.isEmpty()) {
                android.util.Log.d(TAG, "Usando cache com " + cached.size() + " redes");
                resolveNetworks(call, cached);
            } else {
                android.util.Log.e(TAG, "startScan() falhou E sem cache disponível");
                call.reject("Não foi possível iniciar o scan. Tente novamente em alguns segundos.");
            }
        } else {
            android.util.Log.d(TAG, "startScan() iniciado com SUCESSO, aguardando resultado...");
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
