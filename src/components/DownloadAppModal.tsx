import { X, Download, Smartphone } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Baixe o Aplicativo Android
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              Para contribuir com o mapeamento das rotas, você precisa usar o 
              <strong> aplicativo Android</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Por que apenas no aplicativo?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Precisamos validar que você está realmente no ônibus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Verificamos o Wi-Fi do veículo para garantir autenticidade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Isso evita dados falsos e mantém o sistema confiável</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-900">
              <strong>💡 Dica:</strong> Você pode continuar visualizando as rotas aqui no navegador. 
              O aplicativo é necessário apenas para contribuir!
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="mt-6 space-y-3">
          <a
            href="/api/apk/download"
            download
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Baixar Aplicativo Android
          </a>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Fechar
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          O aplicativo é gratuito e seguro
        </p>
      </div>
    </div>
  );
}
