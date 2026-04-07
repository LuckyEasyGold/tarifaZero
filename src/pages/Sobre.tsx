import { useState, useEffect } from 'react';
import { ExternalLink, Heart, Copy, Check, Instagram, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import packageJson from '../../package.json';

interface Supporter {
  id: string;
  name: string;
  socialUrl?: string;
  socialLabel?: string;
  avatarUrl?: string;
}

export default function Sobre() {
  const [copied, setCopied] = useState(false);
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  const PIX_KEY = '46991966464';

  useEffect(() => {
    fetch('/api/supporters')
      .then(res => res.json())
      .then(data => { if (data.success) setSupporters(data.data); })
      .catch(() => {});
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      toast.success('Chave Pix copiada!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-700 text-white px-4 py-8 text-center pt-12">
        <img 
          src="/logoTarifaZero.png" 
          alt="Tarifa Zero" 
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h1 className="text-2xl font-bold">Tarifa Zero</h1>
        <p className="text-blue-200 text-sm mt-2">Acompanhe o transporte público em tempo real</p>
        <p className="text-blue-300 text-xs mt-1">Palmas - PR</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        
        {/* Apoie o projeto */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={20} className="text-red-500" />
            <h2 className="font-semibold text-gray-900">Apoie o Projeto</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            O Tarifa Zero é gratuito e independente. Se ele te ajuda no dia a dia,
            considere contribuir para cobrir os custos de servidores e GPS.
          </p>
          <div className="bg-white rounded-lg border border-green-300 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Chave Pix (telefone)</p>
            <p className="text-xl font-bold text-green-700 tracking-widest">{PIX_KEY}</p>
            <p className="text-xs text-gray-500 mt-1">Vinícius Ribeiro Ramos</p>
            <button onClick={handleCopyPix}
              className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar chave'}
            </button>
          </div>
        </div>

        {/* Quem já contribuiu */}
        {supporters.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Quem já contribuiu 💛</h2>
            <div className="flex flex-wrap gap-2">
              {supporters.map(s => (
                s.socialUrl ? (
                  <a key={s.id} href={s.socialUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition">
                    <Instagram size={13} />
                    {s.name}
                  </a>
                ) : (
                  <span key={s.id} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {s.name}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Legal & Privacidade */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" /> Legal & Privacidade
          </h2>
          <Link to="/politica-privacidade"
            className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 py-1">
            <span>Política de Privacidade, Termos e LGPD</span>
            <ExternalLink size={14} className="text-gray-400" />
          </Link>
          <p className="text-xs text-gray-400 mt-2">
            Você já aceitou os termos ao entrar no app. Acesse o link acima para reler a qualquer momento.
          </p>
        </div>

        {/* Contato do Desenvolvedor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👨‍💻</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Vinícius Ribeiro Ramos</h2>
              <p className="text-xs text-gray-500">Desenvolvedor</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">📧</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a href="mailto:viniciusribramos@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
                  viniciusribramos@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600">📱</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">WhatsApp</p>
                <a href="https://wa.me/5542991066464" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium">
                  (42) 99106-6464
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Entre em contato para reportar bugs, sugerir melhorias, tirar dúvidas sobre o app ou contratar.
          </p>
        </div>

        {/* Versão */}
        <p className="text-center text-xs text-gray-400 pb-2">
          Tarifa Zero v{packageJson.version} · Build {new Date().toISOString().split('T')[0]} · Palmas/PR · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
