const certificadosService = require('../services/certificadosService');

/**
 * Controller de Certificados
 * Gerencia requisições de upload e gerenciamento de certificados
 */

class CertificadosController {
  /**
   * POST /api/certificados/upload
   * Fazer upload de certificado
   */
  async upload(req, res) {
    try {
      const { empresaId, cnpj, razaoSocial, senha } = req.body;
      const file = req.file;

      // Validações
      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo de certificado é obrigatório',
        });
      }

      if (!empresaId || !cnpj || !razaoSocial || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Dados da empresa e senha são obrigatórios',
        });
      }

      // Validar certificado
      const validacao = await certificadosService.validarCertificado(
        file.buffer,
        senha
      );

      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          error: 'Certificado inválido ou senha incorreta',
          details: validacao.message,
        });
      }

      // Processar certificado
      const resultado = await certificadosService.processarCertificado(
        file.buffer,
        senha,
        empresaId,
        cnpj,
        razaoSocial
      );

      return res.status(201).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao fazer upload do certificado',
        details: error.details || error.message,
      });
    }
  }

  /**
   * GET /api/certificados/empresa/:empresaId
   * Listar certificados de uma empresa
   */
  async listarPorEmpresa(req, res) {
    try {
      const { empresaId } = req.params;

      if (!empresaId) {
        return res.status(400).json({
          success: false,
          error: 'ID da empresa é obrigatório',
        });
      }

      const resultado = await certificadosService.listarCertificadosPorEmpresa(
        empresaId
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar certificados',
        details: error.details || error.message,
      });
    }
  }

  /**
   * GET /api/certificados/:id
   * Obter detalhes de um certificado
   */
  async obter(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do certificado é obrigatório',
        });
      }

      const resultado = await certificadosService.obterCertificado(id);

      return res.status(200).json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(404).json({
        success: false,
        error: 'Certificado não encontrado',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /api/certificados/:id
   * Deletar um certificado
   */
  async deletar(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do certificado é obrigatório',
        });
      }

      const resultado = await certificadosService.deletarCertificado(id);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar certificado',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/certificados/validar
   * Validar certificado sem salvar
   */
  async validar(req, res) {
    try {
      const { senha } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo de certificado é obrigatório',
        });
      }

      if (!senha) {
        return res.status(400).json({
          success: false,
          error: 'Senha é obrigatória',
        });
      }

      const resultado = await certificadosService.validarCertificado(
        file.buffer,
        senha
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao validar certificado',
        details: error.message,
      });
    }
  }
}

module.exports = new CertificadosController();
