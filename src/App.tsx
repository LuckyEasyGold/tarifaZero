import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import BottomNav from '@/components/BottomNav';
import SplashScreen from '@/components/SplashScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Home from '@/pages/Home';
import Linhas from '@/pages/Linhas';
import LinhaDetalhes from '@/pages/LinhaDetalhes';
import BuscarRota from '@/pages/BuscarRota';
import Contribuir from '@/pages/Contribuir';
import Ranking from '@/pages/Ranking';
import PoliticaPrivacidade from '@/pages/PoliticaPrivacidade';
import './App.css';

// v2.1 - Splash sempre ativo, simulação de ônibus, navegação corrigida
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userSetup, setUserSetup] = useState(false);

  useEffect(() => {
    // Verificar se usuário já aceitou termos
    const hasAcceptedTerms = localStorage.getItem('acceptedTerms');
    const userNickname = localStorage.getItem('userNickname');
    
    if (hasAcceptedTerms) {
      setUserSetup(true);
    }
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

    setShowWelcome(false);
    setUserSetup(true);
  };

  // Mostrar splash sempre
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Mostrar welcome se não aceitou termos
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/linhas" element={<Linhas />} />
          <Route path="/linha/:id" element={<LinhaDetalhes />} />
          <Route path="/buscar" element={<BuscarRota />} />
          <Route path="/contribuir" element={<Contribuir />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        </Routes>

        <BottomNav />
        
        {/* Prompt de instalação PWA */}
        <PWAInstallPrompt />
      </div>
    </BrowserRouter>
  );
}

export default App;