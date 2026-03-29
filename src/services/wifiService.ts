import { WifiNetwork } from '@/hooks/useWifiScanner';

interface IdentifyResult {
  success: boolean;
  identified: boolean;
  matchType?: 'bssid' | 'ssid';
  line?: {
    id: string;
    code: string;
    name: string;
    colorHex: string;
  };
  wifi?: {
    ssid: string;
    bssid: string | null;
  };
  confidence?: number;
  message?: string;
  error?: string;
}

export const wifiService = {
  /**
   * Identifica a linha do ônibus baseado nas redes Wi-Fi detectadas
   */
  async identifyLine(networks: WifiNetwork[]): Promise<IdentifyResult> {
    try {
      const response = await fetch('/api/wifi/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ networks }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error identifying line:', error);
      return {
        success: false,
        identified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Registra uma nova rede Wi-Fi para uma linha
   * (usado quando usuário confirma "este é o Wi-Fi do ônibus")
   */
  async registerWifi(lineId: string, ssid: string, bssid: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/wifi/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lineId, ssid, bssid }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering wifi:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
