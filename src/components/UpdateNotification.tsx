import { useState, useEffect } from 'react';
import { Download, X, AlertCircle, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

interface VersionInfo {
  version: string;
  versionCode: number;
  releaseDate: string;
  downloadUrl: string;
  changelog: string[];
  minVersion: string;
  forceUpdate: boolean;
}

export default function UpdateNotification() {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Só verifica atualização no app nativo
    if (!isNative) return;

    initUpdateCheck();
  }, [isNative]);

  const initUpdateCheck = async () => {
    try {
      const info = await App.getInfo();
      const deviceVersion = info.version;
      const deviceVersionCode = parseInt(info.build || '0', 10);
      
      setCurrentVersion(deviceVersion);

      // Verifica se já foi dispensado nesta sessão
      const dismissedVersion = sessionStorage.getItem('dismissedUpdateVersion');
      if (dismissedVersion === deviceVersion) {
        return;
      }

      checkForUpdates(deviceVersionCode);
    } catch (err) {
      console.error('Erro ao ler versão nativa:', err);
    }
  };

  const checkForUpdates = async (deviceVersionCode: number) => {
    try {
      // Adiciona timestamp param para evitar chache do servidor
      const response = await fetch('https://tarifazero.vercel.app/version.json?t=' + new Date().getTime());
      
      if (!response.ok) {
        console.warn('Não foi possível verificar atualizações:', response.status);
        return;
      }
      
      const latestVersion = await response.json();
      
      if (latestVersion && latestVersion.versionCode) {
        // Compara versionCode
        if (latestVersion.versionCode > deviceVersionCode) {
          setVersionInfo(latestVersion);
          setUpdateAvailable(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      // Não faz nada - apenas loga o erro
    }
  };

  const handleDismiss = () => {
    if (versionInfo && !versionInfo.forceUpdate) {
      sessionStorage.setItem('dismissedUpdateVersion', currentVersion);
      setDismissed(true);
    }
  };

  const handleDownload = async () => {
    if (!versionInfo?.downloadUrl) return;

    setDownloading(true);
    setDownloadProgress(0);

    try {
      console.log('[Update] Iniciando download:', versionInfo.downloadUrl);

      // Fazer download do APK
      const response = await fetch(versionInfo.downloadUrl);
      
      if (!response.ok) {
        throw new Error('Erro ao baixar atualização');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          // Salvar APK no diretório de cache
          const fileName = `TarifaZero-${versionInfo.version}.apk`;
          const result = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
          });

          console.log('[Update] APK salvo:', result.uri);
          setDownloadProgress(100);

          // Abrir APK para instalação
          await Browser.open({ 
            url: result.uri,
            presentationStyle: 'popover'
          });

          // Fechar app após 1 segundo
          setTimeout(() => {
            App.exitApp();
          }, 1000);

        } catch (error) {
          console.error('[Update] Erro ao salvar APK:', error);
          // Fallback: abrir no navegador
          window.open(versionInfo.downloadUrl, '_blank');
        }
      };

      reader.readAsDataURL(blob);

    } catch (error) {
      console.error('[Update] Erro no download:', error);
      // Fallback: abrir no navegador
      window.open(versionInfo.downloadUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  if (!updateAvailable || dismissed || !versionInfo) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="flex-shrink-0 mt-0.5">
            {versionInfo.forceUpdate ? (
              <AlertCircle size={20} className="text-yellow-300" />
            ) : (
              <Download size={20} />
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">
                {versionInfo.forceUpdate 
                  ? '⚠️ Atualização Obrigatória' 
                  : '🎉 Nova Versão Disponível!'}
              </h3>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                v{versionInfo.version}
              </span>
            </div>
            
            <p className="text-xs text-blue-100 mb-2">
              {versionInfo.forceUpdate
                ? 'Esta atualização é necessária para continuar usando o app.'
                : 'Baixe a nova versão para aproveitar as melhorias!'}
            </p>

            {/* Changelog (apenas primeiros 3 itens) */}
            {versionInfo.changelog.length > 0 && (
              <ul className="text-xs text-blue-50 space-y-0.5 mb-2">
                {versionInfo.changelog.slice(0, 3).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            )}

            {/* Botão de download */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Baixando... {downloadProgress}%
                </>
              ) : (
                <>
                  <Download size={14} />
                  Baixar e Instalar
                </>
              )}
            </button>
          </div>

          {/* Botão fechar (apenas se não for obrigatória) */}
          {!versionInfo.forceUpdate && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition"
              aria-label="Dispensar"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
