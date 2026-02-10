const empresasService = require('../services/empresasService');

/**
 * Controller de Empresas
 * Gerencia requisições relacionadas a empresas
 */

class EmpresasController {
  /**
   * GET /api/empresas
   * Listar todas as empresas
   */
  async listar(req, res) {
    try {
      const resultado = await empresasService.listarEmpresas();
      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar empresas',
        details: error.details || error.message
      });
    }
  }

  /**
   * GET /api/empresas/ativas
   * Listar apenas empresas ativas
   */
  async listarAtivas(req, res) {
    try {
      const resultado = await empresasService.listarEmpresasAtivas();
      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar empresas ativas',
        details: error.details || error.message
      });
    }
  }

  /**
   * GET /api/empresas/:id
   * Obter empresa por ID
   */
  async obterPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da empresa é obrigatório'
        });
      }

      const resultado = await empresasService.obterEmpresaPorId(id);
      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(404).json({
        success: false,
        error: 'Empresa não encontrada',
        details: error.details || error.message
      });
    }
  }

  /**
   * GET /api/empresas/cnpj/:cnpj
   * Obter empresa por CNPJ
   */
  async obterPorCNPJ(req, res) {
    try {
      const { cnpj } = req.params;

      if (!cnpj) {
        return res.status(400).json({
          success: false,
          error: 'CNPJ da empresa é obrigatório'
        });
      }

      const resultado = await empresasService.obterEmpresaPorCNPJ(cnpj);
      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(404).json({
        success: false,
        error: 'Empresa não encontrada',
        details: error.details || error.message
      });
    }
  }
}

module.exports = new EmpresasController();
