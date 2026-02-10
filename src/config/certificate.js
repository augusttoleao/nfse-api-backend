const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Carrega o certificado digital (PEM) e configura o agente HTTPS
 * para autenticação na API NFSe Nacional
 * 
 * Os arquivos PEM são pré-extraídos do arquivo PFX usando openssl:
 * openssl pkcs12 -in cert.pfx -passin pass:PASSWORD -out cert.pem -nokeys -nodes -legacy
 * openssl pkcs12 -in cert.pfx -passin pass:PASSWORD -out key.pem -nocerts -nodes -legacy
 */
class CertificateManager {
  constructor() {
    this.certPath = path.resolve('./certs/cert.pem');
    this.keyPath = path.resolve('./certs/key.pem');
    this.httpsAgent = null;
  }

  /**
   * Inicializa o agente HTTPS com o certificado e chave
   * @returns {https.Agent} Agente HTTPS configurado
   */
  initializeAgent() {
    try {
      if (!fs.existsSync(this.certPath)) {
        throw new Error(`Certificado não encontrado em: ${this.certPath}`);
      }

      if (!fs.existsSync(this.keyPath)) {
        throw new Error(`Chave privada não encontrada em: ${this.keyPath}`);
      }

      const cert = fs.readFileSync(this.certPath, 'utf8');
      const key = fs.readFileSync(this.keyPath, 'utf8');

      this.httpsAgent = new https.Agent({
        cert: cert,
        key: key,
        rejectUnauthorized: false, // Apenas para testes, ajustar em produção
      });

      console.log('✓ Certificado digital carregado com sucesso');
      return this.httpsAgent;
    } catch (error) {
      console.error('✗ Erro ao carregar certificado:', error.message);
      throw error;
    }
  }

  /**
   * Retorna o agente HTTPS configurado
   * @returns {https.Agent} Agente HTTPS
   */
  getAgent() {
    if (!this.httpsAgent) {
      this.initializeAgent();
    }
    return this.httpsAgent;
  }
}

module.exports = new CertificateManager();
