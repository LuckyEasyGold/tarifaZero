// Script para testar API localmente SEM Vercel CLI
import { createServer } from 'http';
import { parse } from 'url';

// Importar handlers
import healthHandler from './health';
import indexHandler from './index';

const PORT = 3001;

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Mock VercelRequest/Response
  const mockReq: any = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: parsedUrl.query,
    body: {},
  };

  const mockRes: any = {
    status: (code: number) => {
      res.statusCode = code;
      return mockRes;
    },
    json: (data: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data, null, 2));
    },
    send: (data: any) => {
      res.end(data);
    },
    setHeader: (key: string, value: string) => {
      res.setHeader(key, value);
    },
  };

  try {
    // Rotas
    if (pathname === '/api' || pathname === '/api/') {
      await indexHandler(mockReq, mockRes);
    } else if (pathname === '/api/health') {
      await healthHandler(mockReq, mockRes);
    } else {
      mockRes.status(404).json({
        success: false,
        error: { message: 'Not found' },
      });
    }
  } catch (err) {
    console.error('Error:', err);
    mockRes.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 API rodando em: http://localhost:${PORT}`);
  console.log(`\n📍 Endpoints disponíveis:`);
  console.log(`   - http://localhost:${PORT}/api`);
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`\n✅ Banco de dados: Conectado ao Neon`);
  console.log(`\n⚠️  Isso é apenas para testes locais!`);
  console.log(`   O deploy real será feito pelo GitHub → Vercel\n`);
});
