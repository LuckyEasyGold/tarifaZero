package com.newsdrop.tarifazero;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    @PluginMethod
    public void installApk(PluginCall call) {
        String uriString = call.getString("uri");
        
        if (uriString == null || uriString.isEmpty()) {
            call.reject("URI do APK não fornecida");
            return;
        }

        try {
            Uri uri;
            
            // Se for um caminho de arquivo, converter para URI do FileProvider
            if (uriString.startsWith("file://")) {
                String filePath = uriString.replace("file://", "");
                File file = new File(filePath);
                
                if (!file.exists()) {
                    call.reject("Arquivo APK não encontrado: " + filePath);
                    return;
                }
                
                // Usar FileProvider para Android 7.0+
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    uri = FileProvider.getUriForFile(
                        getContext(),
                        getContext().getPackageName() + ".fileprovider",
                        file
                    );
                } else {
                    uri = Uri.fromFile(file);
                }
            } else {
                uri = Uri.parse(uriString);
            }

            // Verificar permissão de instalação de fontes desconhecidas (Android 8+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                boolean canInstall = getContext().getPackageManager().canRequestPackageInstalls();
                
                if (!canInstall) {
                    Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    settingsIntent.setData(Uri.parse("package:" + getContext().getPackageName()));
                    settingsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(settingsIntent);
                    
                    JSObject result = new JSObject();
                    result.put("status", "permission_required");
                    result.put("uri", uriString);
                    call.resolve(result);
                    return;
                }
            }

            // Criar Intent de instalação
            Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            intent.setData(uri);
            intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                intent.putExtra(Intent.EXTRA_RETURN_RESULT, true);
            }
            intent.putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true);

            // Disparar instalador
            getActivity().startActivity(intent);
            
            // Fechar a Activity do app imediatamente para evitar congelamento
            getActivity().finishAndRemoveTask();
            
            JSObject result = new JSObject();
            result.put("status", "install_triggered");
            call.resolve(result);
            
        } catch (Exception e) {
            call.reject("Falha ao iniciar instalação: " + e.getMessage(), e);
        }
    }
}
