import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Serviço de Certificados Digitais
 * Gerencia upload, armazenamento e conversão de certificados PFX
 */

class CertificadosService {
  /**
   * Processar e salvar certificado
   * @param {Buffer} filePFX - Arquivo PFX em buffer
   * @param {string} senha - Senha do certificado
   * @param {number} empresaId - ID da empresa
   * @param {string} cnpj - CNPJ da empresa
   * @param {string} razaoSocial - Razão social da empresa
   * @returns {Promise<Object>} Dados do certificado processado
   */
  async processarCertificado(filePFX, senha, empresaId, cnpj, razaoSocial) {
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const pfxPath = path.join(tempDir, `cert_${timestamp}.pfx`);
      const pemPath = path.join(tempDir, `cert_${timestamp}.pem`);
      const keyPath = path.join(tempDir, `cert_${timestamp}.key`);

      // Salvar arquivo PFX temporário
      fs.writeFileSync(pfxPath, filePFX);

      // Converter PFX para PEM usando OpenSSL
      try {
        execSync(
          `openssl pkcs12 -in "${pfxPath}" -out "${pemPath}" -nodes -passin pass:"${senha}" 2>/dev/null`,
          { encoding: 'utf-8' }
        );
      } catch (error) {
        // Tentar com legacy provider
        execSync(
          `openssl pkcs12 -in "${pfxPath}" -out "${pemPath}" -nodes -passin pass:"${senha}" -provider legacy -provider default 2>/dev/null`,
          { encoding: 'utf-8' }
        );
      }

      // Ler certificado PEM
      const certificadoPEM = fs.readFileSync(pemPath, 'utf-8');

      // Extrair informações do certificado
      const certInfo = this.extrairInfosCertificado(certificadoPEM);

      // Limpar arquivos temporários
      fs.unlinkSync(pfxPath);
      fs.unlinkSync(pemPath);
      if (fs.existsSync(keyPath)) {
        fs.unlinkSync(keyPath);
      }

      return {
        success: true,
        data: {
          empresaId,
          cnpj,
          razaoSocial,
          certificadoPEM,
          certificadoBIN: filePFX,
          numeroSerie: certInfo.numeroSerie,
          dataVencimento: certInfo.dataVencimento,
          assunto: certInfo.assunto,
          emissor: certInfo.emissor,
          senha: senha, // Armazenar senha (considerar criptografia em produção)
          dataProcessamento: new Date().toISOString(),
        },
      };
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
   * Extrair informações do certificado
   * @param {string} certificadoPEM - Certificado em formato PEM
   * @returns {Object} Informações extraídas
   */
  extrairInfosCertificado(certificadoPEM) {
    try {
      const tempFile = path.join(process.cwd(), 'temp', `cert_${Date.now()}.pem`);
      fs.writeFileSync(tempFile, certificadoPEM);

      const output = execSync(`openssl x509 -in "${tempFile}" -text -noout`, {
        encoding: 'utf-8',
      });

      fs.unlinkSync(tempFile);

      // Extrair informações usando regex
      const numeroSerieMatch = output.match(/Serial Number:\s*([a-f0-9:]+)/i);
      const dataVencimentoMatch = output.match(/Not After\s*:\s*(.+)/);
      const assuntoMatch = output.match(/Subject:\s*(.+)/);
      const emissorMatch = output.match(/Issuer:\s*(.+)/);

      return {
        numeroSerie: numeroSerieMatch ? numeroSerieMatch[1].trim() : 'N/A',
        dataVencimento: dataVencimentoMatch ? dataVencimentoMatch[1].trim() : 'N/A',
        assunto: assuntoMatch ? assuntoMatch[1].trim() : 'N/A',
        emissor: emissorMatch ? emissorMatch[1].trim() : 'N/A',
      };
    } catch (error) {
      console.error('Erro ao extrair informações do certificado:', error);
      return {
        numeroSerie: 'N/A',
        dataVencimento: 'N/A',
        assunto: 'N/A',
        emissor: 'N/A',
      };
    }
  }

  /**
   * Validar certificado
   * @param {Buffer} filePFX - Arquivo PFX
   * @param {string} senha - Senha do certificado
   * @returns {Promise<Object>} Resultado da validação
   */
  async validarCertificado(filePFX, senha) {
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const pfxPath = path.join(tempDir, `cert_test_${timestamp}.pfx`);
      const pemPath = path.join(tempDir, `cert_test_${timestamp}.pem`);

      fs.writeFileSync(pfxPath, filePFX);

      try {
        execSync(
          `openssl pkcs12 -in "${pfxPath}" -out "${pemPath}" -nodes -passin pass:"${senha}" 2>/dev/null`,
          { encoding: 'utf-8' }
        );
      } catch {
        execSync(
          `openssl pkcs12 -in "${pfxPath}" -out "${pemPath}" -nodes -passin pass:"${senha}" -provider legacy -provider default 2>/dev/null`,
          { encoding: 'utf-8' }
        );
      }

      fs.unlinkSync(pfxPath);
      fs.unlinkSync(pemPath);

      return {
        success: true,
        valido: true,
        message: 'Certificado válido',
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
   * @param {number} empresaId - ID da empresa
   * @returns {Promise<Array>} Lista de certificados
   */
  async listarCertificadosPorEmpresa(empresaId) {
    try {
      // Simulação até que o banco MSSQL seja configurado
      return {
        success: true,
        data: [],
        message: 'Nenhum certificado cadastrado para esta empresa',
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
   * @param {number} certificadoId - ID do certificado
   * @returns {Promise<Object>} Dados do certificado
   */
  async obterCertificado(certificadoId) {
    try {
      // Simulação até que o banco MSSQL seja configurado
      throw new Error('Certificado não encontrado');
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
   * Deletar certificado
   * @param {number} certificadoId - ID do certificado
   * @returns {Promise<Object>} Resultado da deleção
   */
  async deletarCertificado(certificadoId) {
    try {
      // Simulação até que o banco MSSQL seja configurado
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

export default new CertificadosService();
