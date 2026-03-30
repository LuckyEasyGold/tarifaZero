import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

export interface WifiNetwork {
  ssid: string;
  bssid: string;
  level: number; // Signal strength
  frequency: number;
}

interface WifiScannerPlugin {
  scan(): Promise<{ networks: WifiNetwork[] }>;
}

const WifiScanner = registerPlugin<WifiScannerPlugin>('WifiScanner');

interface UseWifiScannerReturn {
  networks: WifiNetwork[];
  isScanning: boolean;
  error: string | null;
  scan: () => Promise<void>;
  isNative: boolean;
}

export function useWifiScanner(): UseWifiScannerReturn {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const scan = useCallback(async () => {
    if (!isNative) {
      setError('Scanner Wi-Fi disponível apenas no app nativo');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      console.log('[WiFi Scanner] Iniciando scan...');
      const result = await WifiScanner.scan();
      console.log('[WiFi Scanner] Resultado:', result);
      
      if (result && result.networks) {
        setNetworks(result.networks);
        console.log('[WiFi Scanner] Redes encontradas:', result.networks.length);
      } else {
        setNetworks([]);
        console.log('[WiFi Scanner] Nenhuma rede encontrada');
      }
    } catch (err) {
      console.error('[WiFi Scanner] Erro ao escanear:', err);
      setError('Erro ao escanear redes Wi-Fi. Verifique as permissões.');
      setNetworks([]);
    } finally {
      setIsScanning(false);
    }
  }, [isNative]);

  // Escanear automaticamente ao montar (apenas no app)
  useEffect(() => {
    if (isNative) {
      console.log('[WiFi Scanner] App nativo detectado, iniciando scan automático');
      // Aguardar 1 segundo para garantir que o app está pronto
      const timer = setTimeout(() => {
        console.log('[WiFi Scanner] Executando scan...');
        scan();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('[WiFi Scanner] Não é app nativo, scanner desabilitado');
    }
  }, [isNative, scan]);

  return {
    networks,
    isScanning,
    error,
    scan,
    isNative,
  };
}
