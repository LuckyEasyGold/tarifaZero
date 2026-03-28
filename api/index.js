// API Health Check
export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    data: {
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
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
}
