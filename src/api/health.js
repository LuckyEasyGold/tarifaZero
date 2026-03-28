// Health Check with Database - Simple Test
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Import Prisma dynamically to avoid build issues
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Tarifa Zero API v1.0',
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
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
