import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface WifiNetwork {
  ssid: string;
  bssid: string;
  level: number; // Signal strength
  frequency: number;
}

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
      // Chamar plugin nativo customizado
      // @ts-ignore - Plugin customizado será criado
      const result = await window.WifiScanner?.scan();
      
      if (result && result.networks) {
        setNetworks(result.networks);
      } else {
        setNetworks([]);
      }
    } catch (err) {
      console.error('Erro ao escanear Wi-Fi:', err);
      setError('Erro ao escanear redes Wi-Fi');
      setNetworks([]);
    } finally {
      setIsScanning(false);
    }
  }, [isNative]);

  // Escanear automaticamente ao montar (apenas no app)
  useEffect(() => {
    if (isNative) {
      scan();
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
