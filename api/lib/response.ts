// API Response utilities
import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

export function success<T>(res: VercelResponse, data: T, status: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
  
  res.status(status).json(response);
}

export function error(
  res: VercelResponse,
  message: string,
  status: number = 400,
  code?: string,
  details?: unknown
): void {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
  
  res.status(status).json(response);
}

export function notFound(res: VercelResponse, resource: string = 'Resource'): void {
  error(res, `${resource} not found`, 404, 'NOT_FOUND');
}

export function unauthorized(res: VercelResponse, message: string = 'Unauthorized'): void {
  error(res, message, 401, 'UNAUTHORIZED');
}

export function forbidden(res: VercelResponse, message: string = 'Forbidden'): void {
  error(res, message, 403, 'FORBIDDEN');
}

export function serverError(res: VercelResponse, err: unknown): void {
  console.error('Server error:', err);
  
  const message = err instanceof Error ? err.message : 'Internal server error';
  error(res, message, 500, 'INTERNAL_ERROR', process.env.NODE_ENV === 'development' ? err : undefined);
}

export function methodNotAllowed(res: VercelResponse, allowedMethods: string[]): void {
  res.setHeader('Allow', allowedMethods.join(', '));
  error(res, `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`, 405, 'METHOD_NOT_ALLOWED');
}

// Middleware para validar método HTTP
export function validateMethod(req: VercelRequest, res: VercelResponse, allowedMethods: string[]): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    methodNotAllowed(res, allowedMethods);
    return false;
  }
  return true;
}
