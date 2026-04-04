/**
 * Badge de Status de Rota
 * 
 * Exibe o status de uma trajetória/rota com cores e ícones apropriados
 */

interface RouteStatusBadgeProps {
  status: 'verified' | 'draft' | 'pending' | 'rejected';
  trustScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export default function RouteStatusBadge({
  status,
  trustScore,
  size = 'sm',
  showScore = true
}: RouteStatusBadgeProps) {
  const config: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    verified: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Verificada',
      icon: '✅'
    },
    draft: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      label: 'Em análise',
      icon: '🟡'
    },
    pending: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Pendente',
      icon: '⏳'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Rejeitada',
      icon: '❌'
    }
  };

  const { bg, text, label, icon } = config[status] || config.pending;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${text} ${sizeClass}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {showScore && trustScore !== undefined && trustScore >= 0.7 && (
        <span className="font-bold">({Math.round(trustScore * 100)}%)</span>
      )}
    </span>
  );
}

/**
 * Badge de Confiança (Trust Score)
 */
interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TrustScoreBadge({ score, size = 'sm' }: TrustScoreBadgeProps) {
  const percentage = Math.round(score * 100);

  let bg = 'bg-gray-100';
  let text = 'text-gray-700';
  let icon = '⚠️';

  if (score >= 0.9) {
    bg = 'bg-green-100';
    text = 'text-green-800';
    icon = '🏆';
  } else if (score >= 0.8) {
    bg = 'bg-green-100';
    text = 'text-green-700';
    icon = '🌟';
  } else if (score >= 0.7) {
    bg = 'bg-blue-100';
    text = 'text-blue-700';
    icon = '⭐';
  } else if (score >= 0.5) {
    bg = 'bg-yellow-100';
    text = 'text-yellow-700';
    icon = '✓';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${text} ${sizeClasses[size]}`}
      title={`Confiança: ${percentage}%`}
    >
      <span>{icon}</span>
      <span>{percentage}%</span>
    </span>
  );
}

/**
 * Badge de Contribuidor
 */
interface ContributorBadgeProps {
  trustScore: number;
  contributions: number;
  size?: 'sm' | 'md';
}

export function ContributorBadge({
  trustScore,
  contributions,
  size = 'sm'
}: ContributorBadgeProps) {
  let label = 'Novo';
  let icon = '🌱';
  let bg = 'bg-gray-100';
  let text = 'text-gray-700';

  if (trustScore >= 0.9 && contributions >= 50) {
    label = 'Mestre';
    icon = '👑';
    bg = 'bg-purple-100';
    text = 'text-purple-800';
  } else if (trustScore >= 0.8 && contributions >= 20) {
    label = 'Veterano';
    icon = '🎖️';
    bg = 'bg-blue-100';
    text = 'text-blue-800';
  } else if (trustScore >= 0.7 && contributions >= 10) {
    label = 'Experiente';
    icon = '🏅';
    bg = 'bg-green-100';
    text = 'text-green-800';
  } else if (contributions >= 1) {
    label = 'Pioneiro';
    icon = '🌟';
    bg = 'bg-yellow-100';
    text = 'text-yellow-800';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${text} ${sizeClass}`}
      title={`${contributions} contribuições • ${Math.round(trustScore * 100)}% confiança`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
