const notasService = require('../services/notasService');

/**
 * Controller para operações com Notas Fiscais
 * Gerencia requisições HTTP e respostas
 */
class NotasController {
  /**
   * GET /api/notas/emitidas
   * Consulta notas fiscais emitidas
   */
  async getNotasEmitidas(req, res) {
    try {
      const filters = {
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
        pagina: req.query.pagina ? parseInt(req.query.pagina) : 1,
        itensPorPagina: req.query.itensPorPagina ? parseInt(req.query.itensPorPagina) : 50,
      };

      // Validar filtros
      const validacao = notasService.validarFiltros(filters);
      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          message: 'Filtros inválidos',
          errors: validacao.erros,
        });
      }

      const resultado = await notasService.consultarNotasEmitidas(filters);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro em getNotasEmitidas:', error);

      const errorData = this.parseError(error);
      return res.status(errorData.status).json({
        success: false,
        message: errorData.message,
        error: errorData.details,
      });
    }
  }

  /**
   * GET /api/notas/recebidas
   * Consulta notas fiscais recebidas
   */
  async getNotasRecebidas(req, res) {
    try {
      const filters = {
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
        pagina: req.query.pagina ? parseInt(req.query.pagina) : 1,
        itensPorPagina: req.query.itensPorPagina ? parseInt(req.query.itensPorPagina) : 50,
      };

      // Validar filtros
      const validacao = notasService.validarFiltros(filters);
      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          message: 'Filtros inválidos',
          errors: validacao.erros,
        });
      }

      const resultado = await notasService.consultarNotasRecebidas(filters);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro em getNotasRecebidas:', error);

      const errorData = this.parseError(error);
      return res.status(errorData.status).json({
        success: false,
        message: errorData.message,
        error: errorData.details,
      });
    }
  }

  /**
   * GET /api/notas/dps/:idDps
   * Consulta uma DPS específica
   */
  async getDps(req, res) {
    try {
      const { idDps } = req.params;

      if (!idDps) {
        return res.status(400).json({
          success: false,
          message: 'ID da DPS é obrigatório',
        });
      }

      const resultado = await notasService.consultarDps(idDps);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro em getDps:', error);

      const errorData = this.parseError(error);
      return res.status(errorData.status).json({
        success: false,
        message: errorData.message,
        error: errorData.details,
      });
    }
  }

  /**
   * GET /api/notas/:chaveAcesso
   * Consulta detalhes de uma nota fiscal específica
   */
  async getDetalhesNota(req, res) {
    try {
      const { chaveAcesso } = req.params;

      if (!chaveAcesso) {
        return res.status(400).json({
          success: false,
          message: 'Chave de acesso é obrigatória',
        });
      }

      const resultado = await notasService.consultarDetalhesNota(chaveAcesso);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro em getDetalhesNota:', error);

      const errorData = this.parseError(error);
      return res.status(errorData.status).json({
        success: false,
        message: errorData.message,
        error: errorData.details,
      });
    }
  }

  /**
   * GET /api/notas/:chaveAcesso/eventos
   * Consulta eventos de uma NFS-e
   */
  async getEventos(req, res) {
    try {
      const { chaveAcesso } = req.params;

      if (!chaveAcesso) {
        return res.status(400).json({
          success: false,
          message: 'Chave de acesso é obrigatória',
        });
      }

      const resultado = await notasService.consultarEventos(chaveAcesso);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro em getEventos:', error);

      const errorData = this.parseError(error);
      return res.status(errorData.status).json({
        success: false,
        message: errorData.message,
        error: errorData.details,
      });
    }
  }

  /**
   * GET /api/notas/:chaveAcesso/danfse
   * Baixa o DANFSe (PDF) de uma NFS-e
   */
  async getDanfse(req, res) {
    try {
      const { chaveAcesso } = req.params;

      if (!chaveAcesso) {
        return res.status(400).json({
          success: false,
          message: 'Chave de acesso é obrigatória',
        });
      }

      const resultado = await notasService.baixarDanfse(chaveAcesso);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro em getDanfse:', error);

      const errorData = this.parseError(error);
      return res.status(errorData.status).json({
        success: false,
        message: errorData.message,
        error: errorData.details,
      });
    }
  }

  /**
   * Faz parse de erros para resposta HTTP
   * @param {Error} error - Erro capturado
   * @returns {object} Objeto com status e mensagem
   */
  parseError(error) {
    try {
      const errorData = JSON.parse(error.message);
      return {
        status: errorData.status || 500,
        message: errorData.message || 'Erro interno do servidor',
        details: errorData.data,
      };
    } catch (e) {
      return {
        status: 500,
        message: 'Erro interno do servidor',
        details: error.message,
      };
    }
  }
}

module.exports = new NotasController();
