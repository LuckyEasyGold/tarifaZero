package com.newsdrop.tarifazero.wifiscanner;

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

    private WifiManager wifiManager;
    private BroadcastReceiver wifiScanReceiver;

    @Override
    public void load() {
        wifiManager = (WifiManager) getContext().getApplicationContext()
                .getSystemService(Context.WIFI_SERVICE);
        android.util.Log.d("WifiScanner", "Plugin carregado");
    }

    @PluginMethod
    public void scan(PluginCall call) {
        android.util.Log.d("WifiScanner", "scan() chamado");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+: pedir NEARBY_WIFI_DEVICES
            android.util.Log.d("WifiScanner", "Android 13+ detectado (API " + Build.VERSION.SDK_INT + ")");
            if (getPermissionState("nearbyWifi") != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.d("WifiScanner", "Permissão NEARBY_WIFI_DEVICES não concedida, solicitando...");
                requestPermissionForAlias("nearbyWifi", call, "permissionsCallback");
                return;
            }
            android.util.Log.d("WifiScanner", "Permissão NEARBY_WIFI_DEVICES OK");
        } else {
            // Android < 13: pedir ACCESS_FINE_LOCATION
            android.util.Log.d("WifiScanner", "Android < 13 detectado (API " + Build.VERSION.SDK_INT + ")");
            if (getPermissionState("location") != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.d("WifiScanner", "Permissão ACCESS_FINE_LOCATION não concedida, solicitando...");
                requestPermissionForAlias("location", call, "permissionsCallback");
                return;
            }
            android.util.Log.d("WifiScanner", "Permissão ACCESS_FINE_LOCATION OK");
        }

        performScan(call);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        android.util.Log.d("WifiScanner", "permissionsCallback() chamado");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (getPermissionState("nearbyWifi") != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.e("WifiScanner", "Permissão NEARBY_WIFI_DEVICES negada");
                call.reject("Permissão 'Dispositivos próximos' necessária para escanear redes Wi-Fi");
                return;
            }
            android.util.Log.d("WifiScanner", "Permissão NEARBY_WIFI_DEVICES concedida");
        } else {
            if (getPermissionState("location") != com.getcapacitor.PermissionState.GRANTED) {
                android.util.Log.e("WifiScanner", "Permissão ACCESS_FINE_LOCATION negada");
                call.reject("Permissão de localização necessária para escanear redes Wi-Fi");
                return;
            }
            android.util.Log.d("WifiScanner", "Permissão ACCESS_FINE_LOCATION concedida");
        }
        performScan(call);
    }

    private void performScan(final PluginCall call) {
        android.util.Log.d("WifiScanner", "performScan() iniciado");
        
        if (wifiManager == null) {
            android.util.Log.e("WifiScanner", "WifiManager é null");
            call.reject("Wi-Fi não disponível neste dispositivo");
            return;
        }

        if (!wifiManager.isWifiEnabled()) {
            android.util.Log.w("WifiScanner", "WiFi está desabilitado, tentando usar cache");
            // Mesmo com Wi-Fi desligado, getScanResults pode retornar cache
            // Tentamos retornar o cache antes de rejeitar
            List<ScanResult> cached = wifiManager.getScanResults();
            if (cached != null && !cached.isEmpty()) {
                android.util.Log.d("WifiScanner", "Cache encontrado com " + cached.size() + " redes");
                resolveNetworks(call, cached);
                return;
            }
            android.util.Log.e("WifiScanner", "WiFi desabilitado e sem cache disponível");
            call.reject("Wi-Fi está desligado. Ative o Wi-Fi e tente novamente.");
            return;
        }
        
        android.util.Log.d("WifiScanner", "WiFi está habilitado");

        // Registrar receiver para capturar resultado do scan
        wifiScanReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                android.util.Log.d("WifiScanner", "BroadcastReceiver.onReceive() chamado");
                
                try {
                    context.unregisterReceiver(this);
                    android.util.Log.d("WifiScanner", "BroadcastReceiver desregistrado");
                } catch (Exception e) {
                    android.util.Log.e("WifiScanner", "Erro ao desregistrar receiver: " + e.getMessage());
                }

                List<ScanResult> results = wifiManager.getScanResults();
                android.util.Log.d("WifiScanner", "Scan completado. Redes encontradas: " + (results != null ? results.size() : 0));
                
                if (results != null && !results.isEmpty()) {
                    resolveNetworks(call, results);
                } else {
                    android.util.Log.w("WifiScanner", "Nenhuma rede encontrada");
                    call.reject("Nenhuma rede Wi-Fi encontrada");
                }
            }
        };

        IntentFilter intentFilter = new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
        getContext().registerReceiver(wifiScanReceiver, intentFilter);
        android.util.Log.d("WifiScanner", "BroadcastReceiver registrado");

        // Android 9+ throttle: startScan pode falhar silenciosamente.
        // Se falhar, retornamos os resultados em cache.
        boolean started = wifiManager.startScan();
        android.util.Log.d("WifiScanner", "wifiManager.startScan() retornou: " + started);
        
        if (!started) {
            android.util.Log.w("WifiScanner", "startScan() falhou, tentando usar cache");
            try {
                getContext().unregisterReceiver(wifiScanReceiver);
            } catch (Exception ignored) {}

            // Fallback: usar resultados em cache
            List<ScanResult> cached = wifiManager.getScanResults();
            if (cached != null && !cached.isEmpty()) {
                android.util.Log.d("WifiScanner", "Usando cache com " + cached.size() + " redes");
                resolveNetworks(call, cached);
            } else {
                android.util.Log.e("WifiScanner", "startScan() falhou e sem cache disponível");
                call.reject("Não foi possível iniciar o scan. Tente novamente em alguns segundos.");
            }
        }
    }

    private void resolveNetworks(PluginCall call, List<ScanResult> results) {
        android.util.Log.d("WifiScanner", "resolveNetworks() chamado com " + results.size() + " redes");
        JSArray networks = new JSArray();

        for (ScanResult result : results) {
            JSObject network = new JSObject();
            String ssid = result.SSID;
            // Android 13+ pode retornar SSID vazio por privacidade sem permissão adequada
            network.put("ssid", (ssid != null && !ssid.isEmpty()) ? ssid : "");
            network.put("bssid", result.BSSID != null ? result.BSSID : "");
            network.put("level", result.level);
            network.put("frequency", result.frequency);
            networks.put(network);
            
            android.util.Log.d("WifiScanner", "Rede: " + 
                (ssid != null && !ssid.isEmpty() ? ssid : "[SSID vazio]") + 
                " (" + result.BSSID + ") - " + result.level + " dBm @ " + result.frequency + " MHz");
        }

        JSObject ret = new JSObject();
        ret.put("networks", networks);
        android.util.Log.d("WifiScanner", "Retornando " + networks.length() + " redes para o JavaScript");
        call.resolve(ret);
    }
}
