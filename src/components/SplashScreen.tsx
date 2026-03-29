import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [canSkip, setCanSkip] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Permitir pular após 5 segundos
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 5000);

    // Auto-completar após 5 segundos (caso vídeo não carregue)
    const autoCompleteTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoCompleteTimer);
    };
  }, [onComplete]);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black flex items-center justify-center"
      onClick={handleSkip}
    >
      {/* Vídeo */}
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoad}
        className="w-full h-full object-cover"
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>

      {/* Loading fallback (caso vídeo não carregue) */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">🚌</div>
            <h1 className="text-4xl font-bold mb-2">Tarifa Zero</h1>
            <p className="text-lg text-white/80">Transporte público gratuito</p>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Skip */}
      {canSkip && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition"
        >
          Pular
        </button>
      )}
    </div>
  );
}
