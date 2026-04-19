import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  error: string | null;
  isTracking: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  startTracking: () => void;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
    error: null,
    isTracking: false,
  });

  const [watchId, setWatchId] = useState<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Solicitar Wake Lock para manter a tela ativa durante gravação
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('[Geolocation] Wake Lock ativado - tela não vai apagar');

        // Reativar wake lock se a visibilidade da página mudar (ex: usuário volta ao app)
        document.addEventListener('visibilitychange', async () => {
          if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
            try {
              wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            } catch {
              // Silencioso - não crítico
            }
          }
        });
      } catch (err) {
        console.log('[Geolocation] Wake Lock não disponível:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('[Geolocation] Wake Lock liberado');
      } catch {
        // Silencioso
      }
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      return false;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      
      if (result.state === 'granted') {
        return true;
      } else if (result.state === 'prompt') {
        // Vai pedir permissão quando startTracking for chamado
        return true;
      } else {
        setState(prev => ({ ...prev, error: 'Permissão de localização negada' }));
        return false;
      }
    } catch {
      // Alguns navegadores não suportam permissions API
      return true;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      return;
    }

    // Usar enableHighAccuracy: true → GPS se disponível, senão Wi-Fi/torres de celular
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000, // Aceitar posição de até 5s atrás (reduz consumo de bateria)
    };

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp,
        error: null,
        isTracking: true,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      // Se falhar com alta precisão, tentar com baixa precisão (funciona em mais aparelhos)
      if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
        console.log('[Geolocation] Alta precisão falhou, tentando baixa precisão...');
        const fallbackOptions: PositionOptions = {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 10000,
        };
        const fallbackId = navigator.geolocation.watchPosition(onSuccess, onFinalError, fallbackOptions);
        setWatchId(fallbackId);
        return;
      }
      onFinalError(error);
    };

    const onFinalError = (error: GeolocationPositionError) => {
      let errorMessage = 'Erro ao obter localização';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permissão de localização negada';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível no momento';
          break;
        case error.TIMEOUT:
          errorMessage = 'Tempo esgotado ao obter localização';
          break;
      }
      setState(prev => ({ ...prev, error: errorMessage, isTracking: false }));
    };

    const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
    setWatchId(id);
    setState(prev => ({ ...prev, isTracking: true, error: null }));

    // Ativar wake lock para manter app ativo durante gravação
    requestWakeLock();
  }, [requestWakeLock]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setState(prev => ({ ...prev, isTracking: false }));
    releaseWakeLock();
  }, [watchId, releaseWakeLock]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      releaseWakeLock();
    };
  }, [watchId, releaseWakeLock]);

  return {
    ...state,
    startTracking,
    stopTracking,
    requestPermission,
  };
}
