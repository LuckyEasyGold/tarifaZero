import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Clock, MapPin } from 'lucide-react';

interface Linha {
  id: string;
  code: string;
  name: string;
  colorHex: string;
  startTime: string;
  endTime: string;
  intervalMin: number;
  _count: {
    stops: number;
  };
}

export default function Linhas() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lines')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLinhas(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar linhas:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Linhas de Ônibus</h1>
          <p className="text-sm text-gray-600 mt-1">{linhas.length} linhas disponíveis</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-3">
        {linhas.map((linha) => (
          <Link
            key={linha.id}
            to={`/linha/${linha.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: linha.colorHex }}
              >
                <Bus size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {linha.name}
                </h3>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{linha.startTime} - {linha.endTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{linha._count.stops} paradas</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Intervalo: {linha.intervalMin} minutos
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
