import { useState, useEffect } from 'react';
import { Download, X, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface VersionInfo {
  version: string;
  versionCode: number;
  releaseDate: string;
  downloadUrl: string;
  changelog: string[];
  minVersion: string;
  forceUpdate: boolean;
}

const CURRENT_VERSION = '2.3.0';
const CURRENT_VERSION_CODE = 4;

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Só verifica atualização no app nativo
    if (!isNative) return;

    // Verifica se já foi dispensado nesta sessão
    const dismissedVersion = sessionStorage.getItem('dismissedUpdateVersion');
    if (dismissedVersion === CURRENT_VERSION) {
      return;
    }

    checkForUpdates();
  }, [isNative]);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/version');
      const data = await response.json();
      
      if (data.success && data.data) {
        const latestVersion = data.data;
        
        // Compara versionCode (mais confiável que string)
        if (latestVersion.versionCode > CURRENT_VERSION_CODE) {
          setVersionInfo(latestVersion);
          setUpdateAvailable(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const handleDismiss = () => {
    if (versionInfo && !versionInfo.forceUpdate) {
      sessionStorage.setItem('dismissedUpdateVersion', CURRENT_VERSION);
      setDismissed(true);
    }
  };

  const handleDownload = () => {
    if (versionInfo?.downloadUrl) {
      window.open(versionInfo.downloadUrl, '_blank');
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
              className="inline-flex items-center gap-1.5 bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition"
            >
              <Download size={14} />
              Baixar Atualização
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
