import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check PostGIS
    const postgisVersion = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT PostGIS_version() as version
    `;
    
    // Count tables
    const tables = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Tarifa Zero API v1.0',
        status: 'healthy',
        database: 'connected',
        postgis: postgisVersion[0]?.version || 'not available',
        tables: Number(tables[0]?.count || 0),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Health check error:', err);
    
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Database connection failed',
        code: 'DATABASE_ERROR',
      },
    });
  }
}
