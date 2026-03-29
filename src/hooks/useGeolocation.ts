import { useState, useEffect, useCallback } from 'react';

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
    } catch (error) {
      // Alguns navegadores não suportam permissions API
      return true;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
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
      let errorMessage = 'Erro ao obter localização';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permissão de localização negada';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível';
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
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setState(prev => ({ ...prev, isTracking: false }));
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    startTracking,
    stopTracking,
    requestPermission,
  };
}
