import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface RankingUser {
  position: number;
  id: string;
  nickname: string;
  points: number;
  level: number;
  totalTrips: number;
  totalPoints: number;
  totalMinutes: number;
  badges: string[];
  streak: number;
}

interface RankingData {
  ranking: RankingUser[];
  stats: {
    totalUsers: number;
    totalPoints: number;
    totalTrips: number;
    totalGPSPoints: number;
  };
  period: string;
}

export default function Ranking() {
  const navigate = useNavigate();
  const [data, setData] = useState<RankingData | null>(null);
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [period]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/ranking?period=${period}&limit=50`);
      const result = await response.json();
      if (result.success) {
        // A API retorna um array diretamente em result.data
        // Vamos transformar para o formato esperado
        const ranking = result.data.map((user: any, index: number) => ({
          position: index + 1,
          id: user.anonymousId,
          nickname: user.nickname || `Usuário${user.anonymousId.slice(0, 3)}`,
          points: user.points || 0,
          level: user.level || 1,
          totalTrips: user.totalTrips || 0,
          totalPoints: user.points || 0,
          totalMinutes: 0,
          badges: user.badges || [],
          streak: 0
        }));
        
        setData({
          ranking,
          stats: {
            totalUsers: ranking.length,
            totalPoints: ranking.reduce((sum: number, u: any) => sum + u.totalPoints, 0),
            totalTrips: ranking.reduce((sum: number, u: any) => sum + u.totalTrips, 0),
            totalGPSPoints: ranking.reduce((sum: number, u: any) => sum + u.totalPoints, 0)
          },
          period
        });
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (position === 2) return <Medal className="text-gray-400" size={24} />;
    if (position === 3) return <Medal className="text-amber-600" size={24} />;
    return null;
  };

  const getBadgeLabel = (badge: string) => {
    const labels: Record<string, string> = {
      first_trip: '🚌 Primeira Viagem',
      frequent_rider: '⭐ Passageiro Frequente',
      super_rider: '🌟 Super Passageiro',
      gps_collector: '📍 Coletor GPS',
      gps_master: '🎯 Mestre GPS',
      week_streak: '🔥 Sequência Semanal',
      month_streak: '💎 Sequência Mensal',
    };
    return labels[badge] || badge;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/contribuir')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={32} />
            <div>
              <h1 className="text-2xl font-bold">Ranking de Contribuidores</h1>
              <p className="text-sm text-white/80">Os heróis do transporte público</p>
            </div>
          </div>

          {/* Estatísticas Gerais */}
          {data && data.ranking && data.ranking.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
                <div className="text-xs text-white/80">Usuários</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{data.stats.totalTrips}</div>
                <div className="text-xs text-white/80">Viagens</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{data.stats.totalGPSPoints}</div>
                <div className="text-xs text-white/80">Pontos GPS</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos os Tempos
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Esta Semana
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Ranking */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {data && data.ranking.length > 0 ? (
          <div className="space-y-3">
            {data.ranking.map((user) => (
              <div
                key={user.id}
                className={`bg-white rounded-lg shadow-sm border p-4 ${
                  user.position <= 3 ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {getMedalIcon(user.position) || (
                      <div className="text-2xl font-bold text-gray-400">
                        {user.position}
                      </div>
                    )}
                  </div>

                  {/* Info do Usuário */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.nickname}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Nível {user.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        <span>{user.points} pts</span>
                      </div>
                      <div>🚌 {user.totalTrips} viagens</div>
                      <div>📍 {user.totalPoints} GPS</div>
                    </div>

                    {/* Badges */}
                    {user.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.badges.slice(0, 3).map((badge) => (
                          <span
                            key={badge}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                          >
                            {getBadgeLabel(badge)}
                          </span>
                        ))}
                        {user.badges.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.badges.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Streak */}
                  {user.streak > 0 && (
                    <div className="flex-shrink-0 text-center">
                      <div className="text-2xl">🔥</div>
                      <div className="text-xs text-gray-600">{user.streak}d</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum contribuidor ainda</p>
            <p className="text-sm text-gray-500 mt-2">
              Seja o primeiro a contribuir!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
