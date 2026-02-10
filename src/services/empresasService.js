const { executeQuery } = require('../config/database');

/**
 * Serviço de Empresas
 * Consulta a tabela EMPRESA do banco MSSQL (Azure - EasyApp)
 * 
 * Colunas da tabela EMPRESA:
 * ID, ID_EMPRESA, CNPJ, RAZAO_SOCIAL, NOME_FANTASIA, ATIVO,
 * BAIRRO, ENDERECO, ENDERECO_NUMERO, ENDERECO_COMPLEMENTO,
 * CEP, CIDADE, UF, INSC_MUNICIPAL, INSC_ESTADUAL, TELEFONE,
 * EMAIL, CNAE, DT_INC, DT_ALT, ENDERECO_CODIGO_IBGE, etc.
 */

class EmpresasService {
  /**
   * Listar todas as empresas do banco de dados
   * @returns {Promise<Object>} Lista de empresas
   */
  async listarEmpresas() {
    try {
      const query = `
        SELECT 
          ID as id,
          ID_EMPRESA as idEmpresa,
          CNPJ as cnpj,
          RAZAO_SOCIAL as razaoSocial,
          NOME_FANTASIA as nomeFantasia,
          ATIVO as ativo,
          BAIRRO as bairro,
          ENDERECO as endereco,
          ENDERECO_NUMERO as enderecoNumero,
          ENDERECO_COMPLEMENTO as enderecoComplemento,
          CEP as cep,
          CIDADE as cidade,
          UF as uf,
          INSC_MUNICIPAL as inscricaoMunicipal,
          INSC_ESTADUAL as inscricaoEstadual,
          TELEFONE as telefone,
          TELEFONE_DDD as telefoneDdd,
          EMAIL as email,
          CNAE as cnae,
          TIPO_INSCRICAO as tipoInscricao,
          DT_INC as dataInclusao,
          DT_ALT as dataAlteracao,
          ENDERECO_CODIGO_IBGE as codigoIbge,
          ENDERECO_LOGRADOURO as logradouro,
          ENDERECO_TIPO_LOGRADOURO as tipoLogradouro,
          NFSE_TOKEN_EMISSAO as nfseTokenEmissao
        FROM EMPRESA
        ORDER BY RAZAO_SOCIAL ASC
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
          ID as id,
          ID_EMPRESA as idEmpresa,
          CNPJ as cnpj,
          RAZAO_SOCIAL as razaoSocial,
          NOME_FANTASIA as nomeFantasia,
          ATIVO as ativo,
          BAIRRO as bairro,
          ENDERECO as endereco,
          ENDERECO_NUMERO as enderecoNumero,
          CEP as cep,
          CIDADE as cidade,
          UF as uf,
          INSC_MUNICIPAL as inscricaoMunicipal,
          INSC_ESTADUAL as inscricaoEstadual,
          TELEFONE as telefone,
          EMAIL as email,
          CNAE as cnae,
          DT_INC as dataInclusao,
          DT_ALT as dataAlteracao,
          ENDERECO_CODIGO_IBGE as codigoIbge,
          NFSE_TOKEN_EMISSAO as nfseTokenEmissao
        FROM EMPRESA
        WHERE CNPJ = @cnpj
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
          ID as id,
          ID_EMPRESA as idEmpresa,
          CNPJ as cnpj,
          RAZAO_SOCIAL as razaoSocial,
          NOME_FANTASIA as nomeFantasia,
          ATIVO as ativo,
          BAIRRO as bairro,
          ENDERECO as endereco,
          ENDERECO_NUMERO as enderecoNumero,
          CEP as cep,
          CIDADE as cidade,
          UF as uf,
          INSC_MUNICIPAL as inscricaoMunicipal,
          INSC_ESTADUAL as inscricaoEstadual,
          TELEFONE as telefone,
          EMAIL as email,
          CNAE as cnae,
          DT_INC as dataInclusao,
          DT_ALT as dataAlteracao,
          ENDERECO_CODIGO_IBGE as codigoIbge,
          NFSE_TOKEN_EMISSAO as nfseTokenEmissao
        FROM EMPRESA
        WHERE ID = @id
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
   * Filtrar empresas ativas (ATIVO = 'S')
   * @returns {Promise<Object>} Lista de empresas ativas
   */
  async listarEmpresasAtivas() {
    try {
      const query = `
        SELECT 
          ID as id,
          ID_EMPRESA as idEmpresa,
          CNPJ as cnpj,
          RAZAO_SOCIAL as razaoSocial,
          NOME_FANTASIA as nomeFantasia,
          ATIVO as ativo,
          BAIRRO as bairro,
          ENDERECO as endereco,
          ENDERECO_NUMERO as enderecoNumero,
          CEP as cep,
          CIDADE as cidade,
          UF as uf,
          INSC_MUNICIPAL as inscricaoMunicipal,
          INSC_ESTADUAL as inscricaoEstadual,
          TELEFONE as telefone,
          EMAIL as email,
          CNAE as cnae,
          DT_INC as dataInclusao,
          DT_ALT as dataAlteracao,
          ENDERECO_CODIGO_IBGE as codigoIbge,
          NFSE_TOKEN_EMISSAO as nfseTokenEmissao
        FROM EMPRESA
        WHERE ATIVO = 'S'
        ORDER BY RAZAO_SOCIAL ASC
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
