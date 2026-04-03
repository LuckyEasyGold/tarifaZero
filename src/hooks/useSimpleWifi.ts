import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorWifi } from '@capgo/capacitor-wifi';

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
      console.log('[useSimpleWifi] Verificando permissões...');

      // 1. Pedir permissão de localização (necessária para WiFi scan no Android)
      const permResult = await CapacitorWifi.checkPermissions();
      console.log('[useSimpleWifi] Status de permissão:', permResult);

      if (permResult.location !== 'granted') {
        console.log('[useSimpleWifi] Solicitando permissão de localização...');
        const reqResult = await CapacitorWifi.requestPermissions();
        if (reqResult.location !== 'granted') {
          setError('Permissão de localização necessária para escanear redes Wi-Fi');
          setNetworks([]);
          return;
        }
      }

      // 2. Iniciar scan ativo para obter dados frescos
      console.log('[useSimpleWifi] Iniciando scan ativo...');
      try {
        await CapacitorWifi.startScan();
        // Aguardar um momento para o scan completar (Android pode levar 2-4s)
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (scanErr: any) {
        // startScan pode falhar no Android 10+ (throttling do sistema)
        // Nesse caso continuamos e tentamos ler o cache
        console.warn('[useSimpleWifi] startScan falhou (normal no Android 10+):', scanErr?.message);
      }

      // 3. Buscar redes disponíveis
      console.log('[useSimpleWifi] Buscando redes com getAvailableNetworks...');
      const result = await CapacitorWifi.getAvailableNetworks();

      console.log('[useSimpleWifi] Resultado completo:', JSON.stringify(result));

      if (result && result.networks && Array.isArray(result.networks)) {
        const formattedNetworks: WifiNetwork[] = result.networks
          .filter((network: any) => network.ssid && network.ssid.trim() !== '')
          .map((network: any) => ({
            ssid: network.ssid || '',
            bssid: network.bssid || '',
            // Plugin retorna campo 'rssi', não 'level'
            level: network.rssi ?? network.level ?? 0,
            frequency: network.frequency || 0,
            capabilities: network.capabilities || '',
          }));

        console.log('[useSimpleWifi] Total de redes filtradas:', formattedNetworks.length);
        setNetworks(formattedNetworks);

        if (formattedNetworks.length === 0) {
          setError('Nenhuma rede Wi-Fi visível. Certifique-se que o Wi-Fi está ligado e tente novamente.');
        } else {
          setError(null);
        }
      } else {
        console.warn('[useSimpleWifi] Resposta inesperada do plugin:', result);
        setNetworks([]);
        setError('Nenhuma rede encontrada. Verifique se o Wi-Fi está ativado.');
      }
    } catch (err: any) {
      console.error('[useSimpleWifi] Erro ao escanear:', err);
      const msg = err?.message || String(err) || 'Erro desconhecido';

      // Mensagem amigável para o erro de plugin não instalado
      if (msg.toLowerCase().includes('not implemented') || msg.toLowerCase().includes('not installed')) {
        setError('Funcionalidade Wi-Fi não disponível neste dispositivo. Use a entrada manual de BSSID.');
      } else {
        setError(`Erro ao escanear: ${msg}`);
      }
      setNetworks([]);
    } finally {
      setIsScanning(false);
    }
  };

  return { networks, isScanning, error, scan, isNative };
}
