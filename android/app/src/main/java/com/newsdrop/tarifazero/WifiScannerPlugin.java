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

    private WifiManager wifiManager;
    private BroadcastReceiver wifiScanReceiver;

    @Override
    public void load() {
        wifiManager = (WifiManager) getContext().getApplicationContext()
                .getSystemService(Context.WIFI_SERVICE);
    }

    @PluginMethod
    public void scan(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+: pedir NEARBY_WIFI_DEVICES
            if (getPermissionState("nearbyWifi") != com.getcapacitor.PermissionState.GRANTED) {
                requestPermissionForAlias("nearbyWifi", call, "permissionsCallback");
                return;
            }
        } else {
            // Android < 13: pedir ACCESS_FINE_LOCATION
            if (getPermissionState("location") != com.getcapacitor.PermissionState.GRANTED) {
                requestPermissionForAlias("location", call, "permissionsCallback");
                return;
            }
        }

        performScan(call);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (getPermissionState("nearbyWifi") != com.getcapacitor.PermissionState.GRANTED) {
                call.reject("Permissão 'Dispositivos próximos' necessária para escanear redes Wi-Fi");
                return;
            }
        } else {
            if (getPermissionState("location") != com.getcapacitor.PermissionState.GRANTED) {
                call.reject("Permissão de localização necessária para escanear redes Wi-Fi");
                return;
            }
        }
        performScan(call);
    }

    private void performScan(final PluginCall call) {
        if (wifiManager == null) {
            call.reject("Wi-Fi não disponível neste dispositivo");
            return;
        }

        if (!wifiManager.isWifiEnabled()) {
            // Mesmo com Wi-Fi desligado, getScanResults pode retornar cache
            // Tentamos retornar o cache antes de rejeitar
            List<ScanResult> cached = wifiManager.getScanResults();
            if (cached != null && !cached.isEmpty()) {
                resolveNetworks(call, cached);
                return;
            }
            call.reject("Wi-Fi está desligado. Ative o Wi-Fi e tente novamente.");
            return;
        }

        // Registrar receiver para capturar resultado do scan
        wifiScanReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                try {
                    context.unregisterReceiver(this);
                } catch (Exception ignored) {}

                List<ScanResult> results = wifiManager.getScanResults();
                if (results != null && !results.isEmpty()) {
                    resolveNetworks(call, results);
                } else {
                    call.reject("Nenhuma rede Wi-Fi encontrada");
                }
            }
        };

        IntentFilter intentFilter = new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
        getContext().registerReceiver(wifiScanReceiver, intentFilter);

        // Android 9+ throttle: startScan pode falhar silenciosamente.
        // Se falhar, retornamos os resultados em cache.
        boolean started = wifiManager.startScan();
        if (!started) {
            try {
                getContext().unregisterReceiver(wifiScanReceiver);
            } catch (Exception ignored) {}

            // Fallback: usar resultados em cache
            List<ScanResult> cached = wifiManager.getScanResults();
            if (cached != null && !cached.isEmpty()) {
                resolveNetworks(call, cached);
            } else {
                call.reject("Não foi possível iniciar o scan. Tente novamente em alguns segundos.");
            }
        }
    }

    private void resolveNetworks(PluginCall call, List<ScanResult> results) {
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
        }

        JSObject ret = new JSObject();
        ret.put("networks", networks);
        call.resolve(ret);
    }
}
