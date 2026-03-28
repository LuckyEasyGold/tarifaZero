// Health Check with Database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check PostGIS
    const postgisVersion = await prisma.$queryRaw`
      SELECT PostGIS_version() as version
    `;
    
    // Count tables
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
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
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (err) {
    console.error('Health check error:', err);
    
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }
}
