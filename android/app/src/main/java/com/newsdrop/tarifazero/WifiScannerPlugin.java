package com.newsdrop.tarifazero;

import android.Manifest;
import android.content.Context;
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
        @Permission(strings = { "android.permission.NEARBY_WIFI_DEVICES" }, alias = "nearbyWifi")
    }
)
public class WifiScannerPlugin extends Plugin {
    private static final String TAG = "WifiScanner";
    private WifiManager wifiManager;

    @Override
    public void load() {
        try {
            Context context = getContext().getApplicationContext();
            wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
            showToast("✅ WiFi Scanner carregado!");
        } catch (Exception e) {
            showToast("❌ Erro ao carregar: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scan(PluginCall call) {
        showToast("🔍 Iniciando scan...");
        
        // Verificar permissões
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+
            if (getPermissionState("nearbyWifi") != com.getcapacitor.PermissionState.GRANTED) {
                showToast("📱 Solicitando permissão...");
                requestPermissionForAlias("nearbyWifi", call, "permissionsCallback");
                return;
            }
        } else {
            // Android < 13
            if (getPermissionState("location") != com.getcapacitor.PermissionState.GRANTED) {
                showToast("📍 Solicitando permissão...");
                requestPermissionForAlias("location", call, "permissionsCallback");
                return;
            }
        }

        // Permissão OK, fazer scan
        doScan(call);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        // Verificar se permissão foi concedida
        boolean granted = false;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            granted = getPermissionState("nearbyWifi") == com.getcapacitor.PermissionState.GRANTED;
        } else {
            granted = getPermissionState("location") == com.getcapacitor.PermissionState.GRANTED;
        }

        if (!granted) {
            showToast("❌ Permissão negada!");
            call.reject("Permissão necessária para escanear WiFi");
            return;
        }

        showToast("✅ Permissão concedida!");
        doScan(call);
    }

    private void doScan(PluginCall call) {
        if (wifiManager == null) {
            showToast("❌ WifiManager NULL!");
            call.reject("WiFi não disponível");
            return;
        }

        if (!wifiManager.isWifiEnabled()) {
            showToast("⚠️ WiFi desligado!");
            call.reject("WiFi está desligado");
            return;
        }

        showToast("📡 Buscando redes...");

        // SIMPLIFICADO: Usar getScanResults() direto (cache do sistema)
        // O Android já escaneia WiFi automaticamente em background
        List<ScanResult> results = wifiManager.getScanResults();

        if (results == null || results.isEmpty()) {
            showToast("⚠️ Nenhuma rede encontrada");
            call.reject("Nenhuma rede WiFi encontrada");
            return;
        }

        showToast("✅ " + results.size() + " redes encontradas!");

        // Converter para JSON
        JSArray networks = new JSArray();
        for (ScanResult result : results) {
            JSObject network = new JSObject();
            network.put("ssid", result.SSID != null ? result.SSID : "");
            network.put("bssid", result.BSSID != null ? result.BSSID : "");
            network.put("level", result.level);
            network.put("frequency", result.frequency);
            networks.put(network);
        }

        JSObject ret = new JSObject();
        ret.put("networks", networks);
        call.resolve(ret);
    }

    private void showToast(final String message) {
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(getContext(), message, Toast.LENGTH_LONG).show();
            }
        });
    }
}
