import { useState, useEffect } from 'react';
import { Download, X, AlertCircle, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { registerPlugin } from '@capacitor/core';

interface AppUpdaterPlugin {
  installApk(options: { uri: string }): Promise<{ status: string }>;
}

const AppUpdater = registerPlugin<AppUpdaterPlugin>('AppUpdater');

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

      // Fazer download do APK com progresso
      const response = await fetch(versionInfo.downloadUrl);
      
      if (!response.ok) {
        throw new Error('Erro ao baixar atualização');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Não foi possível ler o arquivo');
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      // Ler o stream com progresso
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Atualizar progresso
        if (total > 0) {
          const progress = Math.round((receivedLength / total) * 100);
          setDownloadProgress(progress);
          console.log('[Update] Progresso:', progress + '%');
        }
      }

      // Combinar chunks em um único array
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Converter para base64
      const blob = new Blob([chunksAll], { type: 'application/vnd.android.package-archive' });
      const base64Data = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          const result = fileReader.result as string;
          resolve(result.split(',')[1]);
        };
        fileReader.onerror = reject;
        fileReader.readAsDataURL(blob);
      });

      console.log('[Update] Download completo, salvando APK...');
      setDownloadProgress(100);

      // Salvar APK no diretório de cache
      const fileName = `TarifaZero-${versionInfo.version}.apk`;
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      console.log('[Update] APK salvo:', result.uri);

      // Aguardar 500ms para usuário ver que completou
      await new Promise(resolve => setTimeout(resolve, 500));

      // Instalar APK usando plugin nativo AppUpdater
      console.log('[Update] Iniciando instalação...');
      
      try {
        const installResult = await AppUpdater.installApk({
          uri: result.uri
        });

        console.log('[Update] Instalador aberto:', installResult.status);
        
        if (installResult.status === 'permission_required') {
          alert('Por favor, permita a instalação de apps de fontes desconhecidas e tente novamente.');
          setDownloading(false);
          return;
        }
        
        // O app será fechado automaticamente pelo plugin após abrir o instalador
        console.log('[Update] App será fechado automaticamente...');

      } catch (installError) {
        console.error('[Update] Erro ao instalar:', installError);
        alert('Erro ao abrir instalador. Por favor, instale manualmente o arquivo baixado.');
        setDownloading(false);
      }

    } catch (error) {
      console.error('[Update] Erro no download:', error);
      alert('Erro ao baixar atualização. Verifique sua conexão e tente novamente.');
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
                  {downloadProgress < 100 ? `Baixando ${downloadProgress}%` : 'Instalando...'}
                </>
              ) : (
                <>
                  <Download size={14} />
                  Baixar e Instalar
                </>
              )}
            </button>

            {/* Barra de progresso */}
            {downloading && downloadProgress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-100 mt-1 text-center">
                  {downloadProgress}% - Aguarde, não feche o app
                </p>
              </div>
            )}

            {downloading && downloadProgress === 100 && (
              <p className="text-xs text-blue-100 mt-2 text-center animate-pulse">
                ✅ Download completo! Abrindo instalador...
              </p>
            )}
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
