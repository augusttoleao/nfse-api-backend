const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { executeQuery, getPool } = require('../config/database');
const sql = require('mssql');

/**
 * Serviço de Certificados Digitais
 * Gerencia upload, armazenamento e conversão de certificados PFX
 * Integrado com tabela NFS_PARAMETRO_CERTIFICADO do MSSQL (Azure)
 * 
 * Colunas: ID, EMPRESA_ID, NOME_ARQUIVO, SENHA, DT_VALIDADE,
 * DT_INC, DT_ALT, USUARIO_INC, USUARIO_ALT, NUMERO_SERIE,
 * ASSUNTO, EMISSOR, CERTIFICADO_BIN
 */

class CertificadosService {
  /**
   * Processar e salvar certificado no banco de dados
   */
  async processarCertificado(filePFX, senha, empresaId, cnpj, razaoSocial) {
    try {
      // Extrair informações do certificado
      const certInfo = await this.extrairInfoCertificadoPFX(filePFX, senha);

      const pool = await getPool();

      // Verificar se já existe certificado para esta empresa
      const checkRequest = pool.request();
      const existente = await checkRequest
        .input('empresaId', sql.Int, parseInt(empresaId))
        .query('SELECT ID FROM NFS_PARAMETRO_CERTIFICADO WHERE EMPRESA_ID = @empresaId');

      if (existente.recordset.length > 0) {
        // Atualizar certificado existente
        const updateRequest = pool.request();
        await updateRequest
          .input('empresaId', sql.Int, parseInt(empresaId))
          .input('nomeArquivo', sql.VarChar(255), `${cnpj}.pfx`)
          .input('senha', sql.VarChar(255), senha)
          .input('dtValidade', sql.DateTime, certInfo.dataVencimento ? new Date(certInfo.dataVencimento) : null)
          .input('dtAlt', sql.DateTime, new Date())
          .input('usuarioAlt', sql.VarChar(100), 'sistema')
          .input('numeroSerie', sql.VarChar(100), certInfo.numeroSerie || null)
          .input('assunto', sql.VarChar(500), certInfo.assunto || null)
          .input('emissor', sql.VarChar(500), certInfo.emissor || null)
          .input('certificadoBin', sql.VarBinary(sql.MAX), filePFX)
          .query(`
            UPDATE NFS_PARAMETRO_CERTIFICADO SET
              NOME_ARQUIVO = @nomeArquivo,
              SENHA = @senha,
              DT_VALIDADE = @dtValidade,
              DT_ALT = @dtAlt,
              USUARIO_ALT = @usuarioAlt,
              NUMERO_SERIE = @numeroSerie,
              ASSUNTO = @assunto,
              EMISSOR = @emissor,
              CERTIFICADO_BIN = @certificadoBin
            WHERE EMPRESA_ID = @empresaId
          `);

        return {
          success: true,
          data: {
            empresaId,
            cnpj,
            razaoSocial,
            ...certInfo,
            atualizado: true,
            dataProcessamento: new Date().toISOString(),
          },
        };
      } else {
        // Inserir novo certificado
        const insertRequest = pool.request();
        const result = await insertRequest
          .input('empresaId', sql.Int, parseInt(empresaId))
          .input('nomeArquivo', sql.VarChar(255), `${cnpj}.pfx`)
          .input('senha', sql.VarChar(255), senha)
          .input('dtValidade', sql.DateTime, certInfo.dataVencimento ? new Date(certInfo.dataVencimento) : null)
          .input('dtInc', sql.DateTime, new Date())
          .input('usuarioInc', sql.VarChar(100), 'sistema')
          .input('numeroSerie', sql.VarChar(100), certInfo.numeroSerie || null)
          .input('assunto', sql.VarChar(500), certInfo.assunto || null)
          .input('emissor', sql.VarChar(500), certInfo.emissor || null)
          .input('certificadoBin', sql.VarBinary(sql.MAX), filePFX)
          .query(`
            INSERT INTO NFS_PARAMETRO_CERTIFICADO 
              (EMPRESA_ID, NOME_ARQUIVO, SENHA, DT_VALIDADE, DT_INC, USUARIO_INC, NUMERO_SERIE, ASSUNTO, EMISSOR, CERTIFICADO_BIN)
            VALUES 
              (@empresaId, @nomeArquivo, @senha, @dtValidade, @dtInc, @usuarioInc, @numeroSerie, @assunto, @emissor, @certificadoBin);
            SELECT SCOPE_IDENTITY() as id;
          `);

        return {
          success: true,
          data: {
            id: result.recordset[0]?.id,
            empresaId,
            cnpj,
            razaoSocial,
            ...certInfo,
            atualizado: false,
            dataProcessamento: new Date().toISOString(),
          },
        };
      }
    } catch (error) {
      console.error('Erro ao processar certificado:', error);
      throw {
        success: false,
        error: 'Erro ao processar certificado',
        details: error.message,
      };
    }
  }

  /**
   * Extrair informações do certificado PFX usando openssl
   */
  async extrairInfoCertificadoPFX(pfxBuffer, senha) {
    const os = require('os');
    const tmpDir = os.tmpdir();
    const tmpPfx = path.join(tmpDir, `cert_${Date.now()}.pfx`);

    try {
      fs.writeFileSync(tmpPfx, pfxBuffer);

      let certInfo = {};

      try {
        const output = execSync(
          `openssl pkcs12 -in "${tmpPfx}" -passin pass:"${senha}" -nokeys -clcerts -legacy 2>/dev/null | openssl x509 -noout -subject -issuer -serial -enddate 2>/dev/null`,
          { encoding: 'utf8', timeout: 10000 }
        );

        const lines = output.split('\n');
        lines.forEach(line => {
          if (line.startsWith('subject=')) {
            certInfo.assunto = line.replace('subject=', '').trim();
          } else if (line.startsWith('issuer=')) {
            certInfo.emissor = line.replace('issuer=', '').trim();
          } else if (line.startsWith('serial=')) {
            certInfo.numeroSerie = line.replace('serial=', '').trim();
          } else if (line.startsWith('notAfter=')) {
            certInfo.dataVencimento = line.replace('notAfter=', '').trim();
          }
        });
      } catch (opensslError) {
        // Tentar sem -legacy
        try {
          const output = execSync(
            `openssl pkcs12 -in "${tmpPfx}" -passin pass:"${senha}" -nokeys -clcerts 2>/dev/null | openssl x509 -noout -subject -issuer -serial -enddate 2>/dev/null`,
            { encoding: 'utf8', timeout: 10000 }
          );

          const lines = output.split('\n');
          lines.forEach(line => {
            if (line.startsWith('subject=')) certInfo.assunto = line.replace('subject=', '').trim();
            else if (line.startsWith('issuer=')) certInfo.emissor = line.replace('issuer=', '').trim();
            else if (line.startsWith('serial=')) certInfo.numeroSerie = line.replace('serial=', '').trim();
            else if (line.startsWith('notAfter=')) certInfo.dataVencimento = line.replace('notAfter=', '').trim();
          });
        } catch (e) {
          console.warn('Aviso: Não foi possível extrair informações do certificado:', e.message);
          certInfo = {
            assunto: 'Não disponível',
            emissor: 'Não disponível',
            numeroSerie: 'Não disponível',
            dataVencimento: null
          };
        }
      }

      return certInfo;
    } finally {
      try { if (fs.existsSync(tmpPfx)) fs.unlinkSync(tmpPfx); } catch (e) { }
    }
  }

  /**
   * Validar certificado sem salvar
   */
  async validarCertificado(filePFX, senha) {
    try {
      const certInfo = await this.extrairInfoCertificadoPFX(filePFX, senha);
      const valido = certInfo.dataVencimento ? new Date(certInfo.dataVencimento) > new Date() : true;

      return {
        success: true,
        valido,
        data: certInfo,
        message: valido ? 'Certificado válido' : 'Certificado expirado',
      };
    } catch (error) {
      return {
        success: false,
        valido: false,
        message: 'Certificado inválido ou senha incorreta',
        details: error.message,
      };
    }
  }

  /**
   * Listar certificados de uma empresa
   */
  async listarCertificadosPorEmpresa(empresaId) {
    try {
      const query = `
        SELECT 
          c.ID as id,
          c.EMPRESA_ID as empresaId,
          c.NOME_ARQUIVO as nomeArquivo,
          c.DT_VALIDADE as dataValidade,
          c.DT_INC as dataInclusao,
          c.DT_ALT as dataAlteracao,
          c.USUARIO_INC as usuarioInclusao,
          c.USUARIO_ALT as usuarioAlteracao,
          c.NUMERO_SERIE as numeroSerie,
          c.ASSUNTO as assunto,
          c.EMISSOR as emissor,
          e.RAZAO_SOCIAL as empresaRazaoSocial,
          e.CNPJ as empresaCnpj
        FROM NFS_PARAMETRO_CERTIFICADO c
        INNER JOIN EMPRESA e ON e.ID = c.EMPRESA_ID
        WHERE c.EMPRESA_ID = @empresaId
        ORDER BY c.DT_INC DESC
      `;

      const certificados = await executeQuery(query, { empresaId: parseInt(empresaId) });

      return {
        success: true,
        data: certificados,
        total: certificados.length,
        message: certificados.length > 0 ? 'Certificados listados com sucesso' : 'Nenhum certificado cadastrado para esta empresa',
      };
    } catch (error) {
      console.error('Erro ao listar certificados:', error);
      throw {
        success: false,
        error: 'Erro ao listar certificados',
        details: error.message,
      };
    }
  }

  /**
   * Obter certificado por ID
   */
  async obterCertificado(certificadoId) {
    try {
      const query = `
        SELECT 
          c.ID as id,
          c.EMPRESA_ID as empresaId,
          c.NOME_ARQUIVO as nomeArquivo,
          c.DT_VALIDADE as dataValidade,
          c.DT_INC as dataInclusao,
          c.NUMERO_SERIE as numeroSerie,
          c.ASSUNTO as assunto,
          c.EMISSOR as emissor,
          e.RAZAO_SOCIAL as empresaRazaoSocial,
          e.CNPJ as empresaCnpj
        FROM NFS_PARAMETRO_CERTIFICADO c
        INNER JOIN EMPRESA e ON e.ID = c.EMPRESA_ID
        WHERE c.ID = @id
      `;

      const certificados = await executeQuery(query, { id: parseInt(certificadoId) });

      if (!certificados || certificados.length === 0) {
        throw new Error('Certificado não encontrado');
      }

      return {
        success: true,
        data: certificados[0],
      };
    } catch (error) {
      console.error('Erro ao obter certificado:', error);
      throw {
        success: false,
        error: 'Certificado não encontrado',
        details: error.message,
      };
    }
  }

  /**
   * Obter certificado da empresa para uso na API SEFIN (retorna PFX buffer + senha)
   */
  async obterCertificadoParaUso(empresaId) {
    try {
      const query = `
        SELECT 
          CERTIFICADO_BIN as certificadoBin,
          SENHA as senha,
          NOME_ARQUIVO as nomeArquivo,
          DT_VALIDADE as dataValidade
        FROM NFS_PARAMETRO_CERTIFICADO
        WHERE EMPRESA_ID = @empresaId
      `;

      const certificados = await executeQuery(query, { empresaId: parseInt(empresaId) });

      if (!certificados || certificados.length === 0) {
        return {
          success: false,
          error: 'Nenhum certificado cadastrado para esta empresa'
        };
      }

      const cert = certificados[0];

      if (cert.dataValidade && new Date(cert.dataValidade) < new Date()) {
        return {
          success: false,
          error: 'Certificado expirado',
          dataValidade: cert.dataValidade
        };
      }

      return {
        success: true,
        data: {
          pfxBuffer: cert.certificadoBin,
          senha: cert.senha,
          nomeArquivo: cert.nomeArquivo,
          dataValidade: cert.dataValidade
        }
      };
    } catch (error) {
      console.error('Erro ao obter certificado para uso:', error);
      throw {
        success: false,
        error: 'Erro ao obter certificado para uso',
        details: error.message
      };
    }
  }

  /**
   * Deletar certificado
   */
  async deletarCertificado(certificadoId) {
    try {
      const query = `DELETE FROM NFS_PARAMETRO_CERTIFICADO WHERE ID = @id`;
      await executeQuery(query, { id: parseInt(certificadoId) });

      return {
        success: true,
        message: 'Certificado deletado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao deletar certificado:', error);
      throw {
        success: false,
        error: 'Erro ao deletar certificado',
        details: error.message,
      };
    }
  }
}

module.exports = new CertificadosService();
