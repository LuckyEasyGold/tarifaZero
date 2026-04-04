interface TrackingData {
  lineId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  wifiSSID?: string | null;
  wifiSignalStrength?: number | null;
  sessionId?: string | null;
}

interface SessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    startTime: string;
    endTime?: string;
    pointsCollected?: number;
    message: string;
  };
  error?: string;
}

interface SubmitResponse {
  success: boolean;
  data?: {
    id: string;
    message: string;
  };
  error?: string;
}

const API_BASE_URL = '/api';

export const trackingService = {
  async startSession(lineId: string): Promise<SessionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          lineId,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor',
      };
    }
  },

  async stopSession(sessionId: string, metadata?: { validationMeta?: any }): Promise<SessionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
          sessionId,
          metadata,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor',
      };
    }
  },

  async submitTrackingData(data: TrackingData): Promise<SubmitResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar dados de tracking:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor',
      };
    }
  },

  async submitBatch(dataArray: TrackingData[]): Promise<SubmitResponse[]> {
    // Enviar múltiplos pontos de uma vez
    const promises = dataArray.map(data => this.submitTrackingData(data));
    return Promise.all(promises);
  },
};
