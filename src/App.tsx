import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import BottomNav from '@/components/BottomNav';
import SplashScreen from '@/components/SplashScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import UpdateNotification from '@/components/UpdateNotification';
import GlobalMenu from '@/components/GlobalMenu';
import ErrorBoundary from '@/components/ErrorBoundary';
import Home from '@/pages/Home';
import Linhas from '@/pages/Linhas';
import LinhaDetalhes from '@/pages/LinhaDetalhes';
import BuscarRota from '@/pages/BuscarRota';
import Contribuir from '@/pages/Contribuir';
import Ranking from '@/pages/Ranking';
import PoliticaPrivacidade from '@/pages/PoliticaPrivacidade';
import Sobre from '@/pages/Sobre';
import TesteWifi from '@/pages/TesteWifi';
import { Capacitor } from '@capacitor/core';
import './App.css';

// v2.4.2.5 - Sistema de versionamento com build number
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userSetup, setUserSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Limpar cache do WebView no app nativo (evita tela branca)
    if (Capacitor.isNativePlatform()) {
      const lastVersion = localStorage.getItem('appVersion');
      const currentVersion = '2.5.0.19';
      
      if (lastVersion !== currentVersion) {
        console.log('[App] Nova versão detectada, limpando cache...');
        
        // Limpar todos os caches
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              console.log('[App] Deletando cache:', name);
              caches.delete(name);
            });
          });
        }
        
        // Limpar sessionStorage (mas manter localStorage com dados importantes)
        sessionStorage.clear();
        
        // Atualizar versão
        localStorage.setItem('appVersion', currentVersion);
        
        console.log('[App] Cache limpo, recarregando...');
        
        // Aguardar um pouco antes de recarregar
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        return; // Não continuar a execução
      }
    }

    // Verificar se usuário já aceitou termos
    const hasAcceptedTerms = localStorage.getItem('acceptedTerms');
    const userNickname = localStorage.getItem('userNickname');
    
    if (hasAcceptedTerms) {
      setUserSetup(true);
    }
    
    // Marcar como carregado após verificações
    setIsLoading(false);
  }, []);

  // Fallback de segurança: detecta tela branca prolongada
  useEffect(() => {
    const timer = setTimeout(() => {
      const root = document.getElementById('root');
      if (root && root.children.length === 0 && !document.querySelector('.hydrated')) {
        console.warn('[Fallback] Hidratação lenta/falha detectada. Recarregando WebView...');
        window.location.reload();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!userSetup) {
      setShowWelcome(true);
    }
  };

  const handleWelcomeComplete = (nickname?: string) => {
    // Gerar ID anônimo único
    let anonymousId = localStorage.getItem('anonymousId');
    if (!anonymousId) {
      anonymousId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('anonymousId', anonymousId);
    }

    // Salvar consentimento e nickname
    localStorage.setItem('acceptedTerms', 'true');
    localStorage.setItem('acceptedTermsDate', new Date().toISOString());
    
    if (nickname) {
      localStorage.setItem('userNickname', nickname);
    }

    // Criar usuário no banco de dados com nickname
    fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousId,
        nickname: nickname || null,
        acceptedTerms: true,
        acceptedTermsDate: new Date().toISOString()
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ Usuário criado no banco:', data);
      })
      .catch(err => {
        console.error('❌ Erro ao criar usuário:', err);
      });

    setShowWelcome(false);
    setUserSetup(true);
  };

  // Mostrar splash sempre
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Mostrar loading se ainda estiver carregando
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-blue-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar welcome se não aceitou termos
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-center" />
          
          {/* Menu global de Perfil e Botão Sair */}
          <GlobalMenu />

          {/* Notificação de atualização (apenas no app nativo) */}
          <UpdateNotification />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/linhas" element={<Linhas />} />
            <Route path="/linha/:id" element={<LinhaDetalhes />} />
            <Route path="/buscar" element={<BuscarRota />} />
            <Route path="/contribuir" element={<Contribuir />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/teste-wifi" element={<TesteWifi />} />
          </Routes>

          <BottomNav />
          
          {/* Prompt de instalação PWA */}
          <PWAInstallPrompt />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;























