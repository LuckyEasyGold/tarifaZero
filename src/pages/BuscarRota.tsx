import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ArrowRight, Loader, AlertCircle, Bus, LocateFixed } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

export default function BuscarRota() {
  const [origem, setOrigem] = useState('');
  const [origCoords, setOrigCoords] = useState<{lat: number, lng: number} | null>(null);

  const [destino, setDestino] = useState('');
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Init Origin
  useEffect(() => {
    getMyLocation();
  }, []);

  const getMyLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
         await Geolocation.requestPermissions();
      }
      
      const position = await Geolocation.getCurrentPosition();
      setOrigCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      setOrigem('📍 Minha Localização Atual');
    } catch (e) {
      console.warn('GPS Error', e);
      // Não forçamos um erro pesado, deixamos digitar manual se quiser
    } finally {
      setLoading(false);
    }
  };

  const handleDestinoChange = (val: string) => {
    setDestino(val);
    setDestCoords(null);
    setShowSuggestions(false);

    if (val.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestions(true);
    setLoadingSuggest(true);

    debounceRef.current = setTimeout(async () => {
      try {
        // Fallback de coordenadas para o centro de Palmas caso não haja GPS originário
        const latParam = origCoords ? `&lat=${origCoords.lat}` : '&lat=-26.4839';
        const lonParam = origCoords ? `&lon=${origCoords.lng}` : '&lon=-51.9882';
        
        // Caixa de contorno geográfico aproximado de Palmas/PR 
        const bboxParam = '&bbox=-52.2,-26.6,-51.8,-26.2';

        // Forçar a palavra Palmas se não tiver na busca para aumentar match do Photon
        const searchQuery = val.toLowerCase().includes('palmas') ? val : `${val} Palmas`;
        
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}${latParam}${lonParam}${bboxParam}&limit=5`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.features) {
          setSuggestions(data.features);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggest(false);
      }
    }, 600);
  };

  const selecionarDestino = (feature: any) => {
    const coords = feature.geometry.coordinates; // [lng, lat] em GeoJSON
    setDestCoords({ lat: coords[1], lng: coords[0] });
    
    const prop = feature.properties;
    const name = [prop.name, prop.street, prop.city].filter(Boolean).join(', ');
    setDestino(name || 'Local selecionado');
    setShowSuggestions(false);
  };

  const handleBuscar = async () => {
    if (!origCoords) {
      setError('Não identificamos as coordenadas da sua Origem. Permita o GPS ou procure outro ponto.');
      return;
    }
    if (!destCoords) {
      setError('Por favor, selecione um Destino válido da lista de sugestões.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setRoutes([]);

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
            <div className="relative">
              <input
                type="text"
                value={origem}
                onChange={(e) => {
                   setOrigem(e.target.value);
                   setOrigCoords(null);
                }}
                placeholder="Ex: Terminal Central"
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                onClick={getMyLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition"
                title="Usar GPS"
              >
                <LocateFixed size={20} />
              </button>
            </div>
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
            <div className="relative">
              <input
                type="text"
                value={destino}
                onChange={(e) => handleDestinoChange(e.target.value)}
                placeholder="Ex: Shopping, Parque..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {/* Dropdown de Sugestões Photon */}
              {showSuggestions && destino.length >= 3 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingSuggest ? (
                    <div className="p-4 flex items-center justify-center text-gray-500">
                      <Loader className="animate-spin mr-2" size={16} /> Procurando...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">Nenhum local encontrado.</div>
                  ) : (
                    <ul>
                      {suggestions.map((feat, idx) => {
                         const p = feat.properties;
                         const nome = p.name || p.street || 'Local';
                         const add = [p.city, p.state].filter(Boolean).join(', ');
                         return (
                          <li 
                            key={idx}
                            onClick={() => selecionarDestino(feat)}
                            className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer flex flex-col"
                          >
                            <span className="font-semibold text-gray-800 text-sm">{nome}</span>
                            <span className="text-xs text-gray-500">{add}</span>
                          </li>
                         )
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
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
