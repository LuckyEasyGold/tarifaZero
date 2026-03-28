import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    success: true,
    data: {
      message: 'Tarifa Zero API v1.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      endpoints: {
        health: './api/health',
        lines: '..api/lines (em breve)',
        stops: './api/stops (em breve)',
      },
    },
  });
}
