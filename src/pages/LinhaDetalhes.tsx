import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Bus } from 'lucide-react';
import BusMap from '@/components/map/BusMap';

interface Stop {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  code: string;
}

interface RoutePoint {
  lat: number;
  lng: number;
  sequence: number;
}

interface Route {
  id: string;
  direction: string;
  points: RoutePoint[];
}

interface LinhaDetalhes {
  id: string;
  code: string;
  name: string;
  colorHex: string;
  startTime: string;
  endTime: string;
  intervalMin: number;
  routes: Route[];
  stops: Stop[];
}

export default function LinhaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [linha, setLinha] = useState<LinhaDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/lines/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLinha(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar linha:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!linha) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <p className="text-gray-600 mb-4">Linha não encontrada</p>
        <button
          onClick={() => navigate('/linhas')}
          className="text-blue-600 hover:underline"
        >
          Voltar para linhas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/linhas')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: linha.colorHex }}
            >
              <Bus size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{linha.name}</h1>
              <p className="text-sm text-gray-600">{linha.code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setShowMap(true)}
              className={`py-3 px-4 border-b-2 font-medium transition ${
                showMap
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setShowMap(false)}
              className={`py-3 px-4 border-b-2 font-medium transition ${
                !showMap
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Paradas ({linha.stops.length})
            </button>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{linha.startTime} - {linha.endTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{linha.stops.length} paradas</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Intervalo: {linha.intervalMin} minutos
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {showMap ? (
        <div className="h-[500px] mx-4 mb-4 rounded-lg overflow-hidden shadow-sm">
          <BusMap
            linhas={[{
              id: linha.id,
              nome: linha.name,
              cor: linha.colorHex,
              corHex: linha.colorHex,
              rota: linha.routes[0]?.points.map(p => ({ lat: p.lat, lng: p.lng })) || [],
              paradas: linha.stops.map(s => ({
                id: s.id,
                nome: s.name,
                coordenadas: { lat: s.lat, lng: s.lng }
              })),
              horarioInicio: linha.startTime,
              horarioFim: linha.endTime,
              intervaloMinutos: linha.intervalMin
            }]}
            posicoes={[]}
            isMobile={true}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {linha.stops
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((stop, index) => (
                <div key={stop.id} className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{stop.name}</h3>
                    {stop.description && (
                      <p className="text-sm text-gray-600 mt-1">{stop.description}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
