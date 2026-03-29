package com.newsdrop.tarifazero;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
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

import java.util.List;

@CapacitorPlugin(
    name = "WifiScanner",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location"),
        @Permission(strings = { Manifest.permission.ACCESS_WIFI_STATE }, alias = "wifiState"),
        @Permission(strings = { Manifest.permission.CHANGE_WIFI_STATE }, alias = "wifiChange")
    }
)
public class WifiScannerPlugin extends Plugin {

    private WifiManager wifiManager;
    private BroadcastReceiver wifiScanReceiver;

    @Override
    public void load() {
        wifiManager = (WifiManager) getContext().getApplicationContext().getSystemService(Context.WIFI_SERVICE);
    }

    @PluginMethod
    public void scan(PluginCall call) {
        if (!hasRequiredPermissions()) {
            requestAllPermissions(call, "scanPermissionsCallback");
            return;
        }

        performScan(call);
    }

    private void performScan(PluginCall call) {
        wifiScanReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                boolean success = intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false);
                
                if (success) {
                    scanSuccess(call);
                } else {
                    scanFailure(call);
                }
                
                getContext().unregisterReceiver(this);
            }
        };

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
        getContext().registerReceiver(wifiScanReceiver, intentFilter);

        boolean success = wifiManager.startScan();
        if (!success) {
            scanFailure(call);
        }
    }

    private void scanSuccess(PluginCall call) {
        List<ScanResult> results = wifiManager.getScanResults();
        JSArray networks = new JSArray();

        for (ScanResult result : results) {
            JSObject network = new JSObject();
            network.put("ssid", result.SSID);
            network.put("bssid", result.BSSID);
            network.put("level", result.level);
            network.put("frequency", result.frequency);
            networks.put(network);
        }

        JSObject ret = new JSObject();
        ret.put("networks", networks);
        call.resolve(ret);
    }

    private void scanFailure(PluginCall call) {
        call.reject("Falha ao escanear redes Wi-Fi");
    }

    @PluginMethod
    public void scanPermissionsCallback(PluginCall call) {
        if (hasRequiredPermissions()) {
            performScan(call);
        } else {
            call.reject("Permissões necessárias não foram concedidas");
        }
    }
}
