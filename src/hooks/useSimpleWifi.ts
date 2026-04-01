import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorWifi } from npm list

export interface WifiNetwork {
  ssid: string;
  bssid: string;
  level: number;
  frequency: number;
  capabilities: string;
}

export function useSimpleWifi() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const scan = async () => {
    if (!isNative) {
      setError('Apenas no app');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      console.log('[useSimpleWifi] Iniciando scan com @capgo/capacitor-wifi...');
      
      // Esta função retorna o array de redes detectadas
      const result = await CapacitorWifi.getAvailableNetworks();
      
      console.log('[useSimpleWifi] Resultado completo:', result);
      console.log('[useSimpleWifi] Redes encontradas:', result.networks);
      
      if (result && result.networks && Array.isArray(result.networks)) {
        const formattedNetworks: WifiNetwork[] = result.networks.map((network: any) => ({
          ssid: network.ssid || '',
          bssid: network.bssid || '',
          level: network.level || 0,
          frequency: network.frequency || 0,
          capabilities: network.capabilities || ''
        }));
        
        console.log('[useSimpleWifi] Total de redes:', formattedNetworks.length);
        setNetworks(formattedNetworks);
        setError(null);
      } else {
        console.warn('[useSimpleWifi] Nenhuma rede encontrada');
        setNetworks([]);
        setError('Nenhuma rede encontrada');
      }
    } catch (err: any) {
      console.error('[useSimpleWifi] Erro ao escanear:', err);
      setError(err.message || 'Erro ao escanear redes WiFi');
      setNetworks([]);
    } finally {
      setIsScanning(false);
    }
  };

  return { networks, isScanning, error, scan, isNative };
}
