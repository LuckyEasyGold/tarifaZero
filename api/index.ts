// API Health Check
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success } from './lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return success(res, {
    message: 'Tarifa Zero API v1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      lines: '/api/lines',
      stops: '/api/stops',
      tracking: '/api/tracking',
      vehicle: '/api/vehicle',
      route: '/api/route',
    },
  });
}
