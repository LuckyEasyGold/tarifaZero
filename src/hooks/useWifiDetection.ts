import { useState, useEffect } from 'react';

interface WifiInfo {
  isConnected: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export function useWifiDetection(): WifiInfo {
  const [wifiInfo, setWifiInfo] = useState<WifiInfo>({
    isConnected: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  useEffect(() => {
    // @ts-ignore - NetworkInformation não está totalmente tipado
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) {
      return;
    }

    const updateConnectionInfo = () => {
      setWifiInfo({
        isConnected: navigator.onLine,
        connectionType: connection.type || null,
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      });
    };

    updateConnectionInfo();

    connection.addEventListener('change', updateConnectionInfo);
    window.addEventListener('online', updateConnectionInfo);
    window.addEventListener('offline', updateConnectionInfo);

    return () => {
      connection.removeEventListener('change', updateConnectionInfo);
      window.removeEventListener('online', updateConnectionInfo);
      window.removeEventListener('offline', updateConnectionInfo);
    };
  }, []);

  return wifiInfo;
}
