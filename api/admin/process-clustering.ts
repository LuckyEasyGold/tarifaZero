/**
 * API Endpoint: POST /api/admin/process-clustering
 * 
 * Executa clustering manual de trajetórias (admin/cron)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runClusteringAllLines, processLineTrajectories } from '../../src/services/clusterRoutes';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Verificar autenticação (adicione sua lógica aqui)
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return res.status(401).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    const { lineId } = req.body;

    console.log('[API] 🔄 Iniciando clustering manual');

    let results;

    if (lineId) {
      // Processar linha específica
      console.log(`[API] 🎯 Processando linha: ${lineId}`);
      results = await processLineTrajectories(lineId);
    } else {
      // Processar todas as linhas
      console.log('[API] 🚀 Processando todas as linhas');
      await runClusteringAllLines();
      results = { message: 'Clustering executado para todas as linhas' };
    }

    return res.status(200).json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] ❌ Erro no clustering:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao executar clustering',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
