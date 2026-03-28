-- Habilitar PostGIS no Neon
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verificar se foi instalado corretamente
SELECT PostGIS_version();
