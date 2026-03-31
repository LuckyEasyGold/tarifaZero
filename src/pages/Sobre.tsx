import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { ExternalLink, Github, Globe, Heart, Copy, Check, LogOut, Instagram, User, Eye, FileText, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

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
  const [anonymousId, setAnonymousId] = useState('');
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const PIX_KEY = '46991966464';
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    setAnonymousId(localStorage.getItem('anonymousId') || '');
    setNickname(localStorage.getItem('userNickname') || '');

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

  const handleSaveNickname = () => {
    const trimmed = newNickname.trim();
    if (!trimmed) { toast.error('Digite um nome válido'); return; }
    localStorage.setItem('userNickname', trimmed);
    setNickname(trimmed);
    setEditingNickname(false);
    setNewNickname('');
    toast.success('Nome atualizado!');
  };

  const handleClose = () => {
    if (isNative) {
      // No app nativo, minimiza para background
      (window as any).navigator?.app?.exitApp?.();
    } else {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-700 text-white px-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center text-4xl">
          👨‍💻
        </div>
        <h1 className="text-2xl font-bold">Vinícius Ribeiro Ramos</h1>
        <p className="text-blue-200 text-sm mt-1">Desenvolvedor & Fundador do Tarifa Zero</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Meu perfil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User size={18} className="text-blue-600" /> Meu Perfil
          </h2>

          {/* Nickname */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Seu nome no app</p>
            {editingNickname ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                  placeholder="Novo nome..."
                  maxLength={30}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={e => e.key === 'Enter' && handleSaveNickname()}
                  autoFocus
                />
                <button onClick={handleSaveNickname} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Salvar
                </button>
                <button onClick={() => setEditingNickname(false)} className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{nickname || 'Anônimo'}</span>
                <button
                  onClick={() => { setNewNickname(nickname); setEditingNickname(true); }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={13} /> Alterar nome
                </button>
              </div>
            )}
          </div>

          {/* ID anônimo */}
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Eye size={12} /> Seu ID anônimo
            </p>
            <p className="text-xs font-mono bg-gray-100 rounded px-2 py-1.5 text-gray-600 break-all">
              {anonymousId || 'Não gerado ainda'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Este ID vincula seus pontos e contribuições. Não o compartilhe.
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Sobre o criador</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Profissional com mais de 15 anos de experiência em gestão de operações, processos e equipes,
            atuando em ambientes públicos e privados com foco em eficiência e melhoria contínua.
            Minha trajetória une visão estratégica à execução técnica.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            🚀 Founder do <span className="font-medium text-blue-700">WhoDo</span>, startup incubada em Palmas/PR,
            com Fintech, MMN em 4 níveis e desenvolvimento Full-Stack.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            📊 Ex-Gestor de Frotas em regional com 13 cidades — reduzi o tempo médio de parada de veículos
            de 25 para 3 dias e gerei economia de 12,5% em manutenção. Unidade premiada com o PNQS.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            💻 Stack: JavaScript, TypeScript, React, Python, Ruby on Rails.
          </p>
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Portfólio & Redes</h2>
          <div className="space-y-2">
            {[
              { label: 'newsdrop.net.br', url: 'https://newsdrop.net.br', icon: <Globe size={16} /> },
              { label: 'whodo.newsdrop.net.br', url: 'https://whodo.newsdrop.net.br', icon: <Globe size={16} /> },
              { label: 'Tarifa Zero Web', url: 'https://newsdrop.net.br/TarifaZero/', icon: <Globe size={16} /> },
              { label: 'GitHub: LuckyEasyGold', url: 'https://github.com/LuckyEasyGold', icon: <Github size={16} /> },
            ].map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 py-1">
                {link.icon}
                {link.label}
                <ExternalLink size={12} className="text-gray-400" />
              </a>
            ))}
          </div>
        </div>

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

        {/* Fechar app */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Fechar Aplicativo</h2>
          <p className="text-sm text-gray-500 mb-3">
            Encerra o app. Seus pontos e histórico ficam salvos.
          </p>
          <button onClick={handleClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-900 transition">
            <LogOut size={16} />
            Fechar app
          </button>
        </div>

        {/* Versão */}
        <p className="text-center text-xs text-gray-400 pb-2">
          Tarifa Zero v2.1 · Palmas/PR · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
