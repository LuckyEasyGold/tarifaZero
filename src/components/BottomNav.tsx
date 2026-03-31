import { Link, useLocation } from 'react-router-dom';
import { Home, Bus, Search, MapPin, Info } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Mapa</span>
          </Link>

          <Link
            to="/linhas"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/linhas') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bus size={24} />
            <span className="text-xs mt-1">Linhas</span>
          </Link>

          <Link
            to="/buscar"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/buscar') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search size={24} />
            <span className="text-xs mt-1">Buscar</span>
          </Link>

          <Link
            to="/contribuir"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/contribuir') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin size={24} />
            <span className="text-xs mt-1">Contribuir</span>
          </Link>

          <Link
            to="/sobre"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/sobre') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Info size={24} />
            <span className="text-xs mt-1">Sobre</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
