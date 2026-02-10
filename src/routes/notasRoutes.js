const express = require('express');
const notasController = require('../controllers/notasController');

const router = express.Router();

/**
 * Rotas para operações com Notas Fiscais de Serviço
 * API NFSe Nacional: https://adn.nfse.gov.br
 */

/**
 * GET /api/notas/emitidas
 * Consulta notas fiscais emitidas
 * Query parameters:
 *   - dataInicio: Data inicial (YYYY-MM-DD)
 *   - dataFim: Data final (YYYY-MM-DD)
 *   - pagina: Número da página (padrão: 1)
 *   - itensPorPagina: Itens por página (padrão: 50)
 */
router.get('/emitidas', notasController.getNotasEmitidas.bind(notasController));

/**
 * GET /api/notas/recebidas
 * Consulta notas fiscais recebidas
 * Query parameters:
 *   - dataInicio: Data inicial (YYYY-MM-DD)
 *   - dataFim: Data final (YYYY-MM-DD)
 *   - pagina: Número da página (padrão: 1)
 *   - itensPorPagina: Itens por página (padrão: 50)
 */
router.get('/recebidas', notasController.getNotasRecebidas.bind(notasController));

/**
 * GET /api/notas/dps/:idDps
 * Consulta uma DPS específica
 * Path parameters:
 *   - idDps: ID da DPS
 */
router.get('/dps/:idDps', notasController.getDps.bind(notasController));

/**
 * GET /api/notas/:chaveAcesso
 * Consulta detalhes de uma nota fiscal específica
 * Path parameters:
 *   - chaveAcesso: Chave de acesso da NFS-e (50 caracteres)
 */
router.get('/:chaveAcesso', notasController.getDetalhesNota.bind(notasController));

/**
 * GET /api/notas/:chaveAcesso/eventos
 * Consulta eventos de uma NFS-e
 * Path parameters:
 *   - chaveAcesso: Chave de acesso da NFS-e (50 caracteres)
 */
router.get('/:chaveAcesso/eventos', notasController.getEventos.bind(notasController));

/**
 * GET /api/notas/:chaveAcesso/danfse
 * Baixa o DANFSe (PDF) de uma NFS-e
 * Path parameters:
 *   - chaveAcesso: Chave de acesso da NFS-e (50 caracteres)
 */
router.get('/:chaveAcesso/danfse', notasController.getDanfse.bind(notasController));

module.exports = router;
