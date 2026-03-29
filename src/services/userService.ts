const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ActiveUser {
  anonymousId: string;
  nickname: string | null;
  currentLat: number;
  currentLng: number;
  isTracking: boolean;
  lastActive: string;
  level: number;
  points: number;
}

export interface ActiveUsersResponse {
  users: ActiveUser[];
  count: number;
  timestamp: string;
}

// Buscar usuários ativos
export async function getActiveUsers(): Promise<ActiveUsersResponse> {
  const response = await fetch(`${API_BASE}/users/active`);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar usuários ativos');
  }
  
  return response.json();
}

// Enviar heartbeat (atualizar posição)
export async function sendHeartbeat(
  anonymousId: string,
  lat?: number,
  lng?: number,
  isTracking?: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE}/users/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anonymousId,
      lat,
      lng,
      isTracking
    }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao enviar heartbeat');
  }
}

// Marcar usuário como offline
export async function markUserOffline(anonymousId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anonymousId,
      isOnline: false
    }),
  });
  
  if (!response.ok) {
    console.error('Erro ao marcar usuário como offline');
  }
}

// Gerar cor única baseada no anonymousId
export function getUserColor(anonymousId: string): string {
  let hash = 0;
  for (let i = 0; i < anonymousId.length; i++) {
    hash = anonymousId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}
