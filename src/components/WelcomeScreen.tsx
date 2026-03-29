import { useState } from 'react';
import { CheckCircle2, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: (nickname?: string) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [nickname, setNickname] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!acceptedTerms) {
      setShowError(true);
      return;
    }
    onComplete(nickname.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 my-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🚌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Tarifa Zero
          </h1>
          <p className="text-gray-600">
            Palmas - PR
          </p>
        </div>

        {/* Descrição */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            O <strong>Tarifa Zero</strong> é um aplicativo colaborativo que mapeia 
            rotas de ônibus em tempo real com a ajuda de pessoas como você. 
            Juntos, criamos um sistema de transporte mais transparente e eficiente!
          </p>
        </div>

        {/* Campo de nome (opcional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Como podemos te chamar? (opcional)
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Seu nome ou apelido"
            maxLength={30}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Isso nos ajuda a personalizar sua experiência
          </p>
        </div>

        {/* Consentimento LGPD */}
        <div className="mb-6">
          <div 
            className={`p-4 border-2 rounded-lg transition ${
              acceptedTerms 
                ? 'border-green-500 bg-green-50' 
                : showError 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setShowError(false);
                }}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="flex-1 text-sm text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-blue-600" />
                  <span className="font-semibold">Consentimento de Uso de Dados (LGPD)</span>
                </div>
                <p className="leading-relaxed">
                  Eu concordo com a coleta e uso dos meus dados de localização GPS 
                  de forma <strong>anônima</strong> para melhorar o mapeamento das rotas 
                  de ônibus. Os dados são usados apenas para fins de mapeamento colaborativo 
                  e não serão compartilhados com terceiros.
                </p>
                <a
                  href="/politica-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs mt-2 inline-block"
                >
                  Ler política completa de privacidade
                </a>
              </label>
            </div>
          </div>
          
          {showError && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span>
              <span>Você precisa aceitar os termos para continuar</span>
            </p>
          )}
        </div>

        {/* Botão continuar */}
        <button
          onClick={handleContinue}
          className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
            acceptedTerms
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 size={20} />
          Começar a Contribuir
        </button>

        {/* Informação adicional */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Seus dados são anônimos e você pode parar de contribuir a qualquer momento
        </p>
      </div>
    </div>
  );
}
