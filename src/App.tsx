import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import BottomNav from '@/components/BottomNav';
import SplashScreen from '@/components/SplashScreen';
import Home from '@/pages/Home';
import Linhas from '@/pages/Linhas';
import LinhaDetalhes from '@/pages/LinhaDetalhes';
import BuscarRota from '@/pages/BuscarRota';
import Contribuir from '@/pages/Contribuir';
import Ranking from '@/pages/Ranking';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Verificar se já visitou antes
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsFirstVisit(false);
      setShowSplash(false);
    } else {
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Mostrar splash apenas na primeira visita
  if (showSplash && isFirstVisit) {
    return <SplashScreen onComplete={handleSplashComplete} />;
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
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;