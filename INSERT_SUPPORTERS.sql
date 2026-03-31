-- Script para inserir os contribuidores iniciais do Tarifa Zero
-- Execute este script diretamente no Neon PostgreSQL

-- Limpar dados existentes (opcional)
-- DELETE FROM supporters;

-- Inserir contribuidores
INSERT INTO supporters (id, name, "socialUrl", "socialLabel", "avatarUrl", active, "createdAt") VALUES
  (
    'clxxx001',
    'Marcos Dieison',
    'https://www.instagram.com/marcdieison',
    'Instagram',
    NULL,
    true,
    NOW()
  ),
  (
    'clxxx002',
    'Din0',
    NULL,
    NULL,
    NULL,
    true,
    NOW()
  ),
  (
    'clxxx003',
    'Leticia',
    'https://www.instagram.com/leti_bzt',
    'Instagram',
    NULL,
    true,
    NOW()
  ),
  (
    'clxxx004',
    'Claudio',
    'https://www.instagram.com/claudiomarturra',
    'Instagram',
    NULL,
    true,
    NOW()
  );

-- Verificar inserção
SELECT * FROM supporters ORDER BY "createdAt";
