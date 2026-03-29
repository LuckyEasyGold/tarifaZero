import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import BottomNav from '@/components/BottomNav';
import Home from '@/pages/Home';
import Linhas from '@/pages/Linhas';
import BuscarRota from '@/pages/BuscarRota';
import Contribuir from '@/pages/Contribuir';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/linhas" element={<Linhas />} />
          <Route path="/buscar" element={<BuscarRota />} />
          <Route path="/contribuir" element={<Contribuir />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;