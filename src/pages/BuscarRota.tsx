import { useState } from 'react';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';

export default function BuscarRota() {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');

  const handleBuscar = () => {
    console.log('Buscar rota:', { origem, destino });
    // TODO: Implementar busca de rota (FASE 8)
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
            disabled={!origem || !destino}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Buscar Rota
          </button>

          {/* Aviso */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              🚧 Funcionalidade em desenvolvimento. Em breve você poderá buscar rotas entre dois pontos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
