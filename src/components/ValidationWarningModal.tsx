import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { TrackValidationResult } from '@/lib/trackValidator';

interface ValidationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validation: TrackValidationResult;
}

export default function ValidationWarningModal({
  isOpen,
  onClose,
  onConfirm,
  validation
}: ValidationWarningModalProps) {
  if (!isOpen) return null;

  const isWarning = !validation.isValid || validation.confidence < 0.7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${isWarning ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="flex items-start gap-3">
            {isWarning ? (
              <AlertTriangle size={28} className="text-yellow-600 flex-shrink-0 mt-1" />
            ) : (
              <CheckCircle size={28} className="text-green-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {isWarning ? 'Padrão Incomum Detectado' : 'Trajetória Validada'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isWarning 
                  ? 'A trajetória gravada apresenta características atípicas para um ônibus urbano.'
                  : 'A trajetória gravada está dentro dos padrões esperados para um ônibus urbano.'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Estatísticas */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">📊 Análise da Trajetória</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Distância:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {validation.distance.toFixed(2)} km
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Duração:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {Math.floor(validation.duration / 60)} min
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Vel. média:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {validation.avgSpeed.toFixed(1)} km/h
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Vel. máxima:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {validation.maxSpeed.toFixed(1)} km/h
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Paradas:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {validation.estimatedStops}
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Confiança:</span>
                <span className={`ml-2 font-bold ${
                  validation.confidence >= 0.7 ? 'text-green-600' :
                  validation.confidence >= 0.5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {(validation.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Problemas detectados */}
          {validation.reasons.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} />
                Problemas Detectados
              </h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                {validation.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explicação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 O que isso significa?</h3>
            <p className="text-sm text-blue-800">
              {isWarning ? (
                <>
                  A trajetória pode ter sido gravada em um carro ou com GPS impreciso. 
                  Contribuições com baixa confiança passam por validação adicional antes 
                  de serem aceitas como rotas oficiais.
                </>
              ) : (
                <>
                  A trajetória está dentro dos padrões esperados e será processada 
                  normalmente. Obrigado por contribuir com dados de qualidade!
                </>
              )}
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                isWarning
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isWarning ? 'Enviar Mesmo Assim' : 'Confirmar e Enviar'}
            </button>
          </div>

          {isWarning && (
            <p className="text-xs text-center text-gray-500 mt-3">
              Ao enviar, você confirma que estava em um ônibus durante a gravação
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
