const axios = require('axios');

/**
 * Serviço de Empresas
 * Consulta a tabela de empresas do banco MSSQL (EasyApp)
 */

class EmpresasService {
  /**
   * Listar todas as empresas do banco de dados
   * @returns {Promise<Array>} Lista de empresas
   */
  async listarEmpresas() {
    try {
      // Simulação de resposta até que o banco MSSQL seja configurado
      // Quando configurado, será feita a consulta real ao banco
      
      const empresas = [
        {
          id: 1,
          cnpj: '00766728000129',
          razaoSocial: 'COOPERCLIM COOPERATIVA DE TRABALHO',
          nomeFantasia: 'COOPERCLIM',
          inscricaoMunicipal: '7165801',
          ativo: true,
          dataAtualizacao: new Date().toISOString()
        }
      ];

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
      const empresas = await this.listarEmpresas();
      const empresa = empresas.data.find(e => e.cnpj === cnpj);

      if (!empresa) {
        throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
      }

      return {
        success: true,
        data: empresa
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
      const empresas = await this.listarEmpresas();
      const empresa = empresas.data.find(e => e.id === parseInt(id));

      if (!empresa) {
        throw new Error(`Empresa com ID ${id} não encontrada`);
      }

      return {
        success: true,
        data: empresa
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
      const empresas = await this.listarEmpresas();
      const ativas = empresas.data.filter(e => e.ativo === true);

      return {
        success: true,
        data: ativas,
        total: ativas.length
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
