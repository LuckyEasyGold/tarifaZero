// Health Check Endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success, serverError } from './lib/response';
import { prisma } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar PostGIS
    const postgisVersion = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT PostGIS_version() as version
    `;
    
    // Contar tabelas
    const tables = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    return success(res, {
      message: 'Tarifa Zero API v1.0',
      status: 'healthy',
      database: 'connected',
      postgis: postgisVersion[0]?.version || 'not available',
      tables: Number(tables[0]?.count || 0),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return serverError(res, err);
  }
}
