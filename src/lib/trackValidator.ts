/**
 * Validador de Padrão de Movimento para Rotas de Ônibus
 * 
 * Detecta se uma trajetória GPS é compatível com padrão de ônibus urbano
 * baseado em velocidade, paradas e comportamento de movimento.
 */

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number; // m/s
  accuracy?: number;
}

export interface TrackValidationResult {
  isValid: boolean;
  confidence: number; // 0.0 - 1.0
  reasons: string[];
  estimatedStops: number;
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  duration: number; // segundos
  distance: number; // km
}

/**
 * Calcula distância entre dois pontos GPS usando fórmula de Haversine
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Detecta paradas na trajetória
 * Parada = velocidade < 1.4 m/s (5 km/h) por ≥20s em raio ≤50m
 */
function detectStops(track: GPSPoint[]): number {
  let stops = 0;
  let stopWindow: GPSPoint[] = [];
  
  for (let i = 0; i < track.length; i++) {
    const point = track[i];
    const speed = point.speed ?? 0;
    
    // Velocidade baixa indica possível parada
    if (speed < 1.4) {
      stopWindow.push(point);
      
      if (stopWindow.length >= 2) {
        const duration = (stopWindow[stopWindow.length - 1].timestamp - stopWindow[0].timestamp) / 1000;
        
        // Verificar se ficou parado por tempo suficiente
        if (duration >= 20) {
          // Verificar se ficou em raio pequeno (≤50m)
          const firstPoint = stopWindow[0];
          const lastPoint = stopWindow[stopWindow.length - 1];
          const distance = calculateDistance(
            firstPoint.lat, firstPoint.lng,
            lastPoint.lat, lastPoint.lng
          ) * 1000; // converter para metros
          
          if (distance <= 50) {
            stops++;
            stopWindow = [point]; // Resetar janela
          }
        }
      }
    } else {
      // Velocidade normal, resetar janela
      if (stopWindow.length > 0) {
        stopWindow = [];
      }
    }
  }
  
  return stops;
}

/**
 * Calcula distância total percorrida
 */
function calculateTotalDistance(track: GPSPoint[]): number {
  let totalDistance = 0;
  
  for (let i = 1; i < track.length; i++) {
    const prev = track[i - 1];
    const curr = track[i];
    totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }
  
  return totalDistance;
}

/**
 * Detecta padrão de zigue-zague (mudanças bruscas de direção)
 */
function detectZigzag(track: GPSPoint[]): number {
  if (track.length < 3) return 0;
  
  let zigzagCount = 0;
  const threshold = 90; // Mudança de direção > 90° é suspeita
  
  for (let i = 2; i < track.length; i++) {
    const p1 = track[i - 2];
    const p2 = track[i - 1];
    const p3 = track[i];
    
    // Calcular ângulo entre vetores (p1->p2) e (p2->p3)
    const angle1 = Math.atan2(p2.lat - p1.lat, p2.lng - p1.lng);
    const angle2 = Math.atan2(p3.lat - p2.lat, p3.lng - p2.lng);
    
    let angleDiff = Math.abs(angle2 - angle1) * 180 / Math.PI;
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    
    if (angleDiff > threshold) {
      zigzagCount++;
    }
  }
  
  return zigzagCount;
}

/**
 * Valida se a trajetória segue padrão de ônibus urbano
 */
export const validateBusPattern = (track: GPSPoint[]): TrackValidationResult => {
  const reasons: string[] = [];
  
  // Validação 1: Trajetória muito curta
  if (track.length < 10) {
    return {
      isValid: false,
      confidence: 0,
      reasons: ['Trajetória muito curta (menos de 10 pontos GPS)'],
      estimatedStops: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      duration: 0,
      distance: 0
    };
  }
  
  // Calcular duração total
  const duration = (track[track.length - 1].timestamp - track[0].timestamp) / 1000; // segundos
  
  // Validação 2: Duração muito curta
  if (duration < 120) { // menos de 2 minutos
    return {
      isValid: false,
      confidence: 0,
      reasons: ['Trajetória muito curta (menos de 2 minutos)'],
      estimatedStops: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      duration,
      distance: 0
    };
  }
  
  // Calcular velocidades
  const speedsKmh = track
    .filter(p => p.speed != null && p.speed > 0)
    .map(p => p.speed! * 3.6); // converter m/s para km/h
  
  const avgSpeed = speedsKmh.length > 0 
    ? speedsKmh.reduce((a, b) => a + b, 0) / speedsKmh.length 
    : 0;
  const maxSpeed = speedsKmh.length > 0 ? Math.max(...speedsKmh) : 0;
  
  // Calcular distância total
  const distance = calculateTotalDistance(track);
  
  // Detectar paradas
  const stops = detectStops(track);
  
  // Detectar zigue-zague
  const zigzagCount = detectZigzag(track);
  
  // Regras de validação
  
  // Regra 1: Velocidade média muito alta (padrão de carro)
  if (avgSpeed > 55) {
    reasons.push(`Velocidade média muito alta (${avgSpeed.toFixed(1)} km/h) - padrão de carro`);
  }
  
  // Regra 2: Velocidade média muito baixa (a pé ou trânsito parado)
  if (avgSpeed < 8 && track.length > 30) {
    reasons.push(`Velocidade média muito baixa (${avgSpeed.toFixed(1)} km/h) - possível trajeto a pé`);
  }
  
  // Regra 3: Poucas paradas para trajeto longo
  if (stops < 3 && track.length > 50 && duration > 600) {
    reasons.push(`Poucas paradas detectadas (${stops}) para trajeto longo - ônibus urbano para frequentemente`);
  }
  
  // Regra 4: Velocidade máxima incompatível com ônibus urbano
  if (maxSpeed > 80) {
    reasons.push(`Pico de velocidade muito alto (${maxSpeed.toFixed(1)} km/h) - incompatível com ônibus urbano`);
  }
  
  // Regra 5: Muitos zigue-zagues (possível GPS ruim ou não seguindo rota)
  const zigzagRatio = zigzagCount / track.length;
  if (zigzagRatio > 0.15) { // Mais de 15% de mudanças bruscas
    reasons.push(`Muitas mudanças bruscas de direção (${zigzagCount}) - possível GPS impreciso`);
  }
  
  // Regra 6: Distância muito curta para o tempo
  const avgSpeedByDistance = distance / (duration / 3600); // km/h
  if (avgSpeedByDistance < 5 && duration > 300) {
    reasons.push(`Distância muito curta (${distance.toFixed(2)} km) para o tempo decorrido`);
  }
  
  // Calcular confiança
  const isValid = reasons.length === 0;
  let confidence = 1.0;
  
  if (!isValid) {
    // Reduzir confiança baseado no número e tipo de problemas
    confidence = Math.max(0.3, 1 - (reasons.length * 0.2));
    
    // Problemas críticos reduzem mais
    if (avgSpeed > 60 || maxSpeed > 90) {
      confidence = Math.min(confidence, 0.4);
    }
  } else {
    // Mesmo válido, ajustar confiança baseado em indicadores positivos
    if (stops >= 3) confidence += 0.05;
    if (avgSpeed >= 15 && avgSpeed <= 40) confidence += 0.05;
    if (zigzagRatio < 0.05) confidence += 0.05;
    
    confidence = Math.min(1.0, confidence);
  }
  
  return {
    isValid,
    confidence,
    reasons,
    estimatedStops: stops,
    avgSpeed,
    maxSpeed,
    duration,
    distance
  };
};

/**
 * Formata resultado de validação para exibição ao usuário
 */
export const formatValidationResult = (result: TrackValidationResult): string => {
  const lines: string[] = [];
  
  lines.push(`📊 Análise da Trajetória:`);
  lines.push(`• Distância: ${result.distance.toFixed(2)} km`);
  lines.push(`• Duração: ${Math.floor(result.duration / 60)} min ${Math.floor(result.duration % 60)} seg`);
  lines.push(`• Velocidade média: ${result.avgSpeed.toFixed(1)} km/h`);
  lines.push(`• Velocidade máxima: ${result.maxSpeed.toFixed(1)} km/h`);
  lines.push(`• Paradas detectadas: ${result.estimatedStops}`);
  lines.push(`• Confiança: ${(result.confidence * 100).toFixed(0)}%`);
  
  if (!result.isValid) {
    lines.push('');
    lines.push('⚠️ Problemas detectados:');
    result.reasons.forEach(reason => {
      lines.push(`• ${reason}`);
    });
  }
  
  return lines.join('\n');
};
