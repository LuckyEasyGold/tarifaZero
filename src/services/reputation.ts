/**
 * Sistema de Reputação e Trust Score
 * 
 * Gerencia a reputação progressiva dos usuários baseada
 * na qualidade de suas contribuições.
 */

export interface TrustScoreCalculation {
  initialScore: number;
  factors: {
    clientConfidence: number;
    wifiBonus: number;
    userHistoryBonus: number;
  };
  finalScore: number;
}

/**
 * Calcula trust score inicial para uma nova contribuição
 */
export function calculateInitialTrust(
  clientConfidence: number,  // 0.0 - 1.0 da validação client-side
  wifiValidated: boolean,    // true se WiFi foi validado
  userTrustScore: number     // 0.1 - 1.0 histórico do usuário
): TrustScoreCalculation {
  // Base: confiança da validação client-side
  let score = clientConfidence;
  
  const factors = {
    clientConfidence,
    wifiBonus: 0,
    userHistoryBonus: 0
  };
  
  // WiFi validado adiciona confiança significativa
  if (wifiValidated) {
    factors.wifiBonus = 0.3;
    score += 0.3;
  }
  
  // Histórico do usuário influencia (máximo 20% de bônus)
  const historyBonus = userTrustScore * 0.2;
  factors.userHistoryBonus = historyBonus;
  score += historyBonus;
  
  // Limitar entre 0.1 e 1.0
  const finalScore = Math.max(0.1, Math.min(1.0, score));
  
  return {
    initialScore: clientConfidence,
    factors,
    finalScore
  };
}

/**
 * Atualiza trust score do usuário baseado no resultado de uma contribuição
 */
export function updateUserTrust(
  currentScore: number,
  trajectoryStatus: 'verified' | 'rejected' | 'draft' | 'pending'
): number {
  let delta = 0;
  
  switch (trajectoryStatus) {
    case 'verified':
      // Contribuição verificada por consenso
      delta = +0.15;
      break;
    case 'rejected':
      // Contribuição rejeitada (dados ruins)
      delta = -0.10;
      break;
    case 'draft':
      // Contribuição em análise (parcialmente validada)
      delta = +0.05;
      break;
    case 'pending':
      // Contribuição aguardando processamento
      delta = +0.02;
      break;
  }
  
  const newScore = currentScore + delta;
  
  // Limitar entre 0.1 e 1.0
  return Math.max(0.1, Math.min(1.0, newScore));
}

/**
 * Calcula pontos de gamificação baseado no status da contribuição
 */
export function calculatePoints(
  basePoints: number,
  trajectoryStatus: 'verified' | 'rejected' | 'draft' | 'pending',
  trustScore: number
): number {
  let multiplier = 0;
  
  switch (trajectoryStatus) {
    case 'verified':
      multiplier = 1.0; // 100% dos pontos
      break;
    case 'draft':
      multiplier = 0.5; // 50% dos pontos
      break;
    case 'pending':
      multiplier = 0.25; // 25% dos pontos
      break;
    case 'rejected':
      multiplier = 0; // Sem pontos
      break;
  }
  
  // Bônus adicional para trust score alto
  if (trustScore >= 0.8) {
    multiplier *= 1.2; // +20% de bônus
  }
  
  return Math.round(basePoints * multiplier);
}

/**
 * Determina badges baseado em trust score e contribuições
 */
export function determineBadges(
  trustScore: number,
  contributions: number,
  verifiedContributions: number
): string[] {
  const badges: string[] = [];
  
  // Badge de confiança
  if (trustScore >= 0.9) {
    badges.push('expert'); // 🏆 Especialista
  } else if (trustScore >= 0.8) {
    badges.push('trusted'); // 🌟 Confiável
  } else if (trustScore >= 0.7) {
    badges.push('reliable'); // ⭐ Confiável
  }
  
  // Badge de contribuições
  if (verifiedContributions >= 50) {
    badges.push('master'); // 👑 Mestre
  } else if (verifiedContributions >= 20) {
    badges.push('veteran'); // 🎖️ Veterano
  } else if (verifiedContributions >= 10) {
    badges.push('experienced'); // 🏅 Experiente
  } else if (verifiedContributions >= 1) {
    badges.push('pioneer'); // 🌱 Pioneiro
  }
  
  // Badge de atividade
  if (contributions >= 100) {
    badges.push('prolific'); // 📊 Prolífico
  } else if (contributions >= 50) {
    badges.push('active'); // 🔥 Ativo
  }
  
  return badges;
}

/**
 * Formata trust score para exibição
 */
export function formatTrustScore(score: number): string {
  const percentage = Math.round(score * 100);
  
  if (score >= 0.9) return `${percentage}% 🏆`;
  if (score >= 0.8) return `${percentage}% 🌟`;
  if (score >= 0.7) return `${percentage}% ⭐`;
  if (score >= 0.5) return `${percentage}% ✓`;
  return `${percentage}% ⚠️`;
}

/**
 * Retorna nível de confiança em texto
 */
export function getTrustLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.7) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}
