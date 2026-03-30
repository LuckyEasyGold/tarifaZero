import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Info } from 'lucide-react';

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
  const [showLegend, setShowLegend] = useState(false);

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
    if (position === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (position === 2) return <Medal className="text-gray-400" size={20} />;
    if (position === 3) return <Medal className="text-amber-600" size={20} />;
    return <span className="text-sm font-bold text-gray-400">{position}</span>;
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
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy size={32} />
              <div>
                <h1 className="text-2xl font-bold">Ranking de Contribuidores</h1>
                <p className="text-sm text-white/80">Os heróis do transporte público</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
              title="Ver legenda"
            >
              <Info size={20} />
            </button>
          </div>

          {/* Legenda */}
          {showLegend && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4 text-sm">
              <h3 className="font-semibold mb-2">Legenda das Colunas:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Nv:</strong> Nível do usuário</div>
                <div><strong>Pts:</strong> Pontos totais</div>
                <div><strong>Viag:</strong> Viagens realizadas</div>
                <div><strong>GPS:</strong> Pontos GPS coletados</div>
              </div>
            </div>
          )}

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

      {/* Tabela de Ranking */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {data && data.ranking.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header da Tabela */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Usuário</div>
                <div className="col-span-1 text-center">Nv</div>
                <div className="col-span-2 text-center">Pts</div>
                <div className="col-span-2 text-center">Viag</div>
                <div className="col-span-2 text-center">GPS</div>
              </div>
            </div>

            {/* Linhas da Tabela */}
            <div className="divide-y divide-gray-200">
              {data.ranking.map((user) => (
                <div
                  key={user.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition ${
                    user.position <= 3 ? 'bg-yellow-50/50' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Posição */}
                    <div className="col-span-1 flex justify-center">
                      {getMedalIcon(user.position)}
                    </div>

                    {/* Usuário */}
                    <div className="col-span-4">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {user.nickname}
                      </div>
                      {user.badges.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {user.badges.slice(0, 2).map((badge) => (
                            <span
                              key={badge}
                              className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded"
                              title={getBadgeLabel(badge)}
                            >
                              {badge === 'first_trip' && '🚌'}
                              {badge === 'frequent_rider' && '⭐'}
                              {badge === 'super_rider' && '🌟'}
                              {badge === 'gps_collector' && '📍'}
                              {badge === 'gps_master' && '🎯'}
                              {badge === 'week_streak' && '🔥'}
                              {badge === 'month_streak' && '💎'}
                            </span>
                          ))}
                          {user.badges.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{user.badges.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nível */}
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {user.level}
                      </span>
                    </div>

                    {/* Pontos */}
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp size={14} className="text-green-600" />
                        <span className="font-semibold text-gray-900">{user.points}</span>
                      </div>
                    </div>

                    {/* Viagens */}
                    <div className="col-span-2 text-center">
                      <span className="text-gray-700">{user.totalTrips}</span>
                    </div>

                    {/* GPS */}
                    <div className="col-span-2 text-center">
                      <span className="text-gray-700">{user.totalPoints}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
