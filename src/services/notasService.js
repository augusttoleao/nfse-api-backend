const httpClient = require('../config/httpClient');

/**
 * Serviço para operações com Notas Fiscais de Serviço
 * Encapsula a lógica de negócio e comunicação com API SEFIN Nacional
 * 
 * Endpoints da API SEFIN Nacional (https://sefin.nfse.gov.br/SefinNacional):
 * - GET /nfse/emitidas - Listar NFS-e emitidas
 * - GET /nfse/recebidas - Listar NFS-e recebidas
 * - GET /nfse/{chaveAcesso} - Consultar NFS-e específica
 * - POST /nfse - Emitir NFS-e (enviar DPS)
 * - GET /danfse/{chaveAcesso} - Baixar DANFSe (PDF)
 */
class NotasService {
  /**
   * Consulta notas fiscais emitidas
   * @param {object} filters - Filtros de consulta
   * @param {string} filters.dataInicio - Data inicial (YYYY-MM-DD)
   * @param {string} filters.dataFim - Data final (YYYY-MM-DD)
   * @param {number} filters.pagina - Número da página
   * @param {number} filters.itensPorPagina - Itens por página
   * @returns {Promise} Lista de notas emitidas
   */
  async consultarNotasEmitidas(filters = {}) {
    try {
      const params = {
        cnpj: process.env.EMITTER_CNPJ,
        inscricaoMunicipal: process.env.EMITTER_INSCRICAO_MUNICIPAL,
        ...filters,
      };

      console.log('Consultando notas emitidas com parâmetros:', params);

      // Endpoint da API SEFIN Nacional
      const response = await httpClient.get('/nfse/emitidas', params);

      return {
        success: true,
        data: response,
        message: 'Notas emitidas consultadas com sucesso',
      };
    } catch (error) {
      console.error('Erro ao consultar notas emitidas:', error.message);
      throw {
        success: false,
        message: 'Erro ao consultar notas emitidas',
        error: error.message,
      };
    }
  }

  /**
   * Consulta notas fiscais recebidas
   * @param {object} filters - Filtros de consulta
   * @param {string} filters.dataInicio - Data inicial (YYYY-MM-DD)
   * @param {string} filters.dataFim - Data final (YYYY-MM-DD)
   * @param {number} filters.pagina - Número da página
   * @param {number} filters.itensPorPagina - Itens por página
   * @returns {Promise} Lista de notas recebidas
   */
  async consultarNotasRecebidas(filters = {}) {
    try {
      const params = {
        cnpj: process.env.EMITTER_CNPJ,
        inscricaoMunicipal: process.env.EMITTER_INSCRICAO_MUNICIPAL,
        ...filters,
      };

      console.log('Consultando notas recebidas com parâmetros:', params);

      // Endpoint da API SEFIN Nacional
      const response = await httpClient.get('/nfse/recebidas', params);

      return {
        success: true,
        data: response,
        message: 'Notas recebidas consultadas com sucesso',
      };
    } catch (error) {
      console.error('Erro ao consultar notas recebidas:', error.message);
      throw {
        success: false,
        message: 'Erro ao consultar notas recebidas',
        error: error.message,
      };
    }
  }

  /**
   * Consulta detalhes de uma nota fiscal específica
   * @param {string} chaveAcesso - Chave de acesso da NFS-e (50 caracteres)
   * @returns {Promise} Detalhes da nota
   */
  async consultarDetalhesNota(chaveAcesso) {
    try {
      if (!chaveAcesso || chaveAcesso.length !== 50) {
        throw new Error('Chave de acesso deve ter 50 caracteres');
      }

      console.log(`Consultando detalhes da nota: ${chaveAcesso}`);

      const response = await httpClient.get(`/nfse/${chaveAcesso}`);

      return {
        success: true,
        data: response,
        message: 'Detalhes da nota consultados com sucesso',
      };
    } catch (error) {
      console.error('Erro ao consultar detalhes da nota:', error.message);
      throw {
        success: false,
        message: 'Erro ao consultar detalhes da nota',
        error: error.message,
      };
    }
  }

  /**
   * Valida os filtros de consulta
   * @param {object} filters - Filtros a validar
   * @returns {object} Objeto com validação
   */
  validarFiltros(filters) {
    const erros = [];

    if (filters.dataInicio && !this.isValidDate(filters.dataInicio)) {
      erros.push('dataInicio deve estar no formato YYYY-MM-DD');
    }

    if (filters.dataFim && !this.isValidDate(filters.dataFim)) {
      erros.push('dataFim deve estar no formato YYYY-MM-DD');
    }

    if (filters.pagina && filters.pagina < 1) {
      erros.push('pagina deve ser maior que 0');
    }

    if (filters.itensPorPagina && filters.itensPorPagina < 1) {
      erros.push('itensPorPagina deve ser maior que 0');
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  /**
   * Valida formato de data
   * @param {string} dateString - Data em formato YYYY-MM-DD
   * @returns {boolean} True se válida
   */
  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
}

module.exports = new NotasService();
