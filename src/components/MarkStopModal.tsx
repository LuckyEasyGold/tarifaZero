import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

interface MarkStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultPlaceholder?: string;
}

export default function MarkStopModal({ isOpen, onClose, onSave, defaultPlaceholder }: MarkStopModalProps) {
  const [stopName, setStopName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (stopName.trim()) {
      onSave(stopName.trim());
      setStopName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setStopName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Marcar Parada de Ônibus
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual o nome desta parada?
            </label>
            <input
              type="text"
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder={defaultPlaceholder || "Ex: Praça Central, Mercadinho do Seu Zé..."}
              maxLength={100}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-900 mb-2">
              💡 Use o nome de algo por perto:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Posto de saúde</li>
              <li>• Praça ou parque</li>
              <li>• Loja conhecida</li>
              <li>• Mercado ou supermercado</li>
              <li>• Nome da rua principal</li>
            </ul>
          </div>
        </div>

        {/* Botões */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!stopName.trim()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
