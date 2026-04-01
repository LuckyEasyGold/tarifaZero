import { useSimpleWifi } from '@/hooks/useSimpleWifi';

export default function TesteWifi() {
  const wifi = useSimpleWifi();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Teste WiFi</h1>
      
      <button
        onClick={wifi.scan}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Escanear
      </button>

      {wifi.error && (
        <div className="bg-red-100 p-3 rounded mb-4">
          Erro: {wifi.error}
        </div>
      )}

      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-2">Redes ({wifi.networks.length}):</h2>
        {wifi.networks.map((name, i) => (
          <div key={i} className="border-b py-2">{name || '[vazio]'}</div>
        ))}
      </div>
    </div>
  );
}
