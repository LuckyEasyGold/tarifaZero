import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Eye, Pencil, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { toast } from 'sonner';

export default function GlobalMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [anonymousId, setAnonymousId] = useState('');
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Carregar IDs na inicialização
    const storedId = localStorage.getItem('anonymousId') || '';
    const storedNick = localStorage.getItem('userNickname') || '';
    if (storedId) setAnonymousId(storedId);
    if (storedNick) setNickname(storedNick);

    // Fechar ao clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingNickname(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveNickname = () => {
    const trimmed = newNickname.trim();
    if (!trimmed) {
      toast.error('Digite um nome válido');
      return;
    }
    localStorage.setItem('userNickname', trimmed);
    setNickname(trimmed);
    setEditingNickname(false);
    toast.success('Nome atualizado!');
  };

  const handleCloseApp = () => {
    if (isNative) {
      App.exitApp();
    } else {
      toast.error('Feche a aba do navegador para sair');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[10000]" ref={menuRef}>
      {/* Botão Flutuante (Avatar/X) */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setNewNickname(nickname);
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isOpen ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label="Menu"
      >
        {isOpen ? <X size={20} /> : <User size={20} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden slide-in-bottom">
          
          <div className="bg-blue-50 px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> 
              Seu Perfil
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Nickname */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Seu nome no app</p>
              {editingNickname ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={e => setNewNickname(e.target.value)}
                    placeholder="Novo nome..."
                    maxLength={30}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleSaveNickname()}
                    autoFocus
                  />
                  <button onClick={handleSaveNickname} className="px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium whitespace-nowrap">
                    Salvar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{nickname || 'Anônimo'}</span>
                  <button
                    onClick={() => { setNewNickname(nickname); setEditingNickname(true); }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                </div>
              )}
            </div>

            {/* ID Anônimo */}
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Eye size={12} /> ID Anônimo
              </p>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-500 break-all border border-gray-100">
                {anonymousId || 'Não gerado ainda'}
              </div>
            </div>
            
            {/* Fechar App */}
            <div className="pt-2 border-t border-gray-100">
              <button 
                onClick={handleCloseApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition"
              >
                <LogOut size={16} />
                Fechar Aplicativo
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
