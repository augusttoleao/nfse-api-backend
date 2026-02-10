const express = require('express');
const empresasController = require('../controllers/empresasController');

const router = express.Router();

/**
 * Rotas de Empresas
 * Base: /api/empresas
 */

// GET /api/empresas - Listar todas as empresas
router.get('/', empresasController.listar.bind(empresasController));

// GET /api/empresas/ativas - Listar apenas empresas ativas
router.get('/ativas', empresasController.listarAtivas.bind(empresasController));

// GET /api/empresas/:id - Obter empresa por ID
router.get('/:id', empresasController.obterPorId.bind(empresasController));

// GET /api/empresas/cnpj/:cnpj - Obter empresa por CNPJ
router.get('/cnpj/:cnpj', empresasController.obterPorCNPJ.bind(empresasController));

module.exports = router;
