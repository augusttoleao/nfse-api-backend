const { executeQuery } = require('../config/database');

/**
 * Serviço de Empresas
 * Consulta a tabela de empresas do banco MSSQL (Azure - EasyApp)
 */

class EmpresasService {
  /**
   * Listar todas as empresas do banco de dados
   * @returns {Promise<Array>} Lista de empresas
   */
  async listarEmpresas() {
    try {
      // Query para buscar todas as empresas da tabela EMPRESA
      const query = `
        SELECT 
          id,
          cnpj,
          razao_social as razaoSocial,
          nome_fantasia as nomeFantasia,
          inscricao_municipal as inscricaoMunicipal,
          ativo,
          data_atualizacao as dataAtualizacao
        FROM EMPRESA
        ORDER BY razao_social ASC
      `;

      const empresas = await executeQuery(query);

      return {
        success: true,
        data: empresas,
        total: empresas.length,
        message: 'Empresas listadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      throw {
        success: false,
        error: 'Erro ao listar empresas',
        details: error.message
      };
    }
  }

  /**
   * Obter empresa por CNPJ
   * @param {string} cnpj - CNPJ da empresa
   * @returns {Promise<Object>} Dados da empresa
   */
  async obterEmpresaPorCNPJ(cnpj) {
    try {
      const query = `
        SELECT 
          id,
          cnpj,
          razao_social as razaoSocial,
          nome_fantasia as nomeFantasia,
          inscricao_municipal as inscricaoMunicipal,
          ativo,
          data_atualizacao as dataAtualizacao
        FROM EMPRESA
        WHERE cnpj = @cnpj
      `;

      const empresas = await executeQuery(query, { cnpj });

      if (!empresas || empresas.length === 0) {
        throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
      }

      return {
        success: true,
        data: empresas[0]
      };
    } catch (error) {
      console.error('Erro ao obter empresa:', error);
      throw {
        success: false,
        error: 'Erro ao obter empresa',
        details: error.message
      };
    }
  }

  /**
   * Obter empresa por ID
   * @param {number} id - ID da empresa
   * @returns {Promise<Object>} Dados da empresa
   */
  async obterEmpresaPorId(id) {
    try {
      const query = `
        SELECT 
          id,
          cnpj,
          razao_social as razaoSocial,
          nome_fantasia as nomeFantasia,
          inscricao_municipal as inscricaoMunicipal,
          ativo,
          data_atualizacao as dataAtualizacao
        FROM EMPRESA
        WHERE id = @id
      `;

      const empresas = await executeQuery(query, { id: parseInt(id) });

      if (!empresas || empresas.length === 0) {
        throw new Error(`Empresa com ID ${id} não encontrada`);
      }

      return {
        success: true,
        data: empresas[0]
      };
    } catch (error) {
      console.error('Erro ao obter empresa:', error);
      throw {
        success: false,
        error: 'Erro ao obter empresa',
        details: error.message
      };
    }
  }

  /**
   * Filtrar empresas ativas
   * @returns {Promise<Array>} Lista de empresas ativas
   */
  async listarEmpresasAtivas() {
    try {
      const query = `
        SELECT 
          id,
          cnpj,
          razao_social as razaoSocial,
          nome_fantasia as nomeFantasia,
          inscricao_municipal as inscricaoMunicipal,
          ativo,
          data_atualizacao as dataAtualizacao
        FROM EMPRESA
        WHERE ativo = 'S' OR ativo = 1 OR ativo = true
        ORDER BY razao_social ASC
      `;

      const empresas = await executeQuery(query);

      return {
        success: true,
        data: empresas,
        total: empresas.length,
        message: 'Empresas ativas listadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao listar empresas ativas:', error);
      throw {
        success: false,
        error: 'Erro ao listar empresas ativas',
        details: error.message
      };
    }
  }
}

module.exports = new EmpresasService();
