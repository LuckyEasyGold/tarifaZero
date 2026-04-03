import { useState } from 'react';
import { MapPin, Navigation, ArrowRight, Loader, AlertCircle, Bus } from 'lucide-react';

export default function BuscarRota() {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);

  const geocodeAddress = async (address: string) => {
    // Busca OpenStreetMap usando city como base, mas permite busca livre.
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError('');
      setRoutes([]);

      const origCoords = await geocodeAddress(origem);
      if (!origCoords) {
        setError('Não foi possível encontrar o endereço de origem no mapa geográfico.');
        return;
      }

      const destCoords = await geocodeAddress(destino);
      if (!destCoords) {
        setError('Não foi possível encontrar o endereço de destino no mapa geográfico.');
        return;
      }

      const res = await fetch(`/api/routing/search?origLat=${origCoords.lat}&origLng=${origCoords.lng}&destLat=${destCoords.lat}&destLng=${destCoords.lng}&radius=1000`);
      const data = await res.json();
      
      if (data.success) {
        if (data.routes && data.routes.length > 0) {
          setRoutes(data.routes);
        } else {
          setError(data.message || 'Nenhuma rota direta encontrada num raio de 1 km.');
        }
      } else {
        setError(data.error || 'Erro na API de busca de rotas.');
      }
    } catch(e) {
      setError('Erro de conexão ou instabilidade na busca de rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Buscar Rota</h1>
          <p className="text-sm text-gray-600 mt-1">Encontre o melhor caminho</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Origem */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Origem
            </label>
            <input
              type="text"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder="Digite o endereço de origem"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Ícone de seta */}
          <div className="flex justify-center my-2">
            <ArrowRight size={24} className="text-gray-400" />
          </div>

          {/* Destino */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Navigation size={16} className="inline mr-1" />
              Destino
            </label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Digite o endereço de destino"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botão Buscar */}
          <button
            onClick={handleBuscar}
            disabled={!origem || !destino || loading}
            className="w-full flex justify-center items-center h-12 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? <Loader className="animate-spin text-white" size={24} /> : 'Buscar Rota'}
          </button>

          {/* Erro */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Sucesso / Rotas Encontradas */}
          {routes.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4 px-1">Linhas Recomendadas (Diretas)</h3>
              <div className="space-y-3">
                {routes.map(line => (
                  <div key={line.id} className="p-4 border border-gray-200 bg-white rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      {/* Badge cor da linha */}
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-inner" 
                        style={{ backgroundColor: line.colorHex || '#3B82F6' }}
                      >
                        <Bus size={20} fill="currentColor" className="text-white/90" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{line.code}</p>
                        <p className="text-xs font-medium text-gray-600">{line.name}</p>
                      </div>
                    </div>
                    <div className="text-blue-500">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
