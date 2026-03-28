// Validation utilities using Zod
import { z } from 'zod';

// Schemas comuns
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const timestampSchema = z.string().datetime().or(z.date());

// Validação de coordenadas GPS
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Validação de precisão GPS (em metros)
export function isAccuracyAcceptable(accuracy: number, maxAccuracy: number = 100): boolean {
  return accuracy > 0 && accuracy <= maxAccuracy;
}

// Validação de velocidade (em km/h)
export function isSpeedRealistic(speed: number, maxSpeed: number = 120): boolean {
  return speed >= 0 && speed <= maxSpeed;
}

// Helper para parse seguro de query params
export function parseQueryParam(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] || defaultValue;
  return defaultValue;
}

export function parseNumberParam(value: unknown, defaultValue: number = 0): number {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function parseBooleanParam(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return defaultValue;
}
