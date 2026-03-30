import { Clock, MapPin, Target } from 'lucide-react';

interface RecordingBannerProps {
  lineName: string;
  duration: string;
  pointsCollected: number;
  accuracy: number | null;
}

export default function RecordingBanner({
  lineName,
  duration,
  pointsCollected,
  accuracy
}: RecordingBannerProps) {
  return (
    <div className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-bold text-lg">Gravando {lineName}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <div>
              <div className="text-xs text-red-100">Tempo</div>
              <div className="font-mono font-semibold">{duration}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <div>
              <div className="text-xs text-red-100">Pontos GPS</div>
              <div className="font-mono font-semibold">{pointsCollected}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target size={16} />
            <div>
              <div className="text-xs text-red-100">Precisão</div>
              <div className="font-mono font-semibold">
                {accuracy ? `${Math.round(accuracy)}m` : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
