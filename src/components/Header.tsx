import { Bus, MapPin, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Header = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tarifa Zero</h1>
              <p className="text-xs text-gray-500">Rastreamento em tempo real</p>
            </div>
          </div>

          {/* Info Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-500" />
                  Sobre o Tarifa Zero
                </DialogTitle>
                <DialogDescription>
                  Sistema de rastreamento de ônibus em tempo real
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  O <strong>Tarifa Zero</strong> permite acompanhar a localização dos ônibus 
                  em tempo real, facilitando o planejamento da sua viagem.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Como usar
                  </h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Selecione a linha desejada no menu</li>
                    <li>• Acompanhe o ônibus no mapa em tempo real</li>
                    <li>• Veja o tempo estimado até a próxima parada</li>
                    <li>• Clique nas paradas para ver horários</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Dados disponíveis</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 5 linhas de ônibus</li>
                    <li>• Posição GPS em tempo real</li>
                    <li>• Horários previstos nas paradas</li>
                    <li>• Velocidade e tempo estimado</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Versão 1.0 • Desenvolvido para sua cidade
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
