import { MapPin, Wifi, Navigation } from 'lucide-react';

export default function Contribuir() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Contribuir</h1>
          <p className="text-sm text-gray-600 mt-1">Ajude a melhorar o sistema</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Card: Como Contribuir */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Como você pode ajudar?</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Compartilhe sua localização</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quando estiver no ônibus, ative o tracking para ajudar a mapear a rota real.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wifi size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Identifique o Wi-Fi do ônibus</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Conecte-se ao Wi-Fi do ônibus para ajudar a identificar qual veículo você está.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Navigation size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Valide paradas</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Confirme se as paradas estão nos locais corretos e ajude a adicionar novas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Iniciar Tracking */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Iniciar Tracking</h2>
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            🚌 Estou no Ônibus - Iniciar Tracking
          </button>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🚧 Funcionalidade em desenvolvimento (FASE 4). Em breve você poderá contribuir com dados em tempo real!
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sua Contribuição</h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-600 mt-1">Viagens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-600 mt-1">Pontos GPS</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-xs text-gray-600 mt-1">Validações</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
