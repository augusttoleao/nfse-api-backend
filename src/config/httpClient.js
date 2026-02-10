const axios = require('axios');
const certificateManager = require('./certificate');

/**
 * Cliente HTTP customizado para comunicação com API NFSe Nacional
 * Utiliza certificado digital para autenticação
 */
class NFSeHttpClient {
  constructor() {
    this.baseURL = process.env.NFSE_API_BASE_URL;
    this.client = null;
    this.initializeClient();
  }

  /**
   * Inicializa o cliente axios com configurações de certificado
   */
  initializeClient() {
    const httpsAgent = certificateManager.getAgent();

    this.client = axios.create({
      baseURL: this.baseURL,
      httpsAgent: httpsAgent,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NFSe-API-Backend/1.0',
      },
    });

    // Interceptor para logging de requisições
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[${new Date().toISOString()}] ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Erro na requisição:', error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor para logging de respostas
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[${new Date().toISOString()}] Status: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`Erro na resposta: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          console.error('Nenhuma resposta recebida:', error.message);
        } else {
          console.error('Erro:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Realiza requisição GET
   * @param {string} endpoint - Endpoint da API
   * @param {object} params - Parâmetros de query
   * @returns {Promise} Resposta da API
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Realiza requisição POST
   * @param {string} endpoint - Endpoint da API
   * @param {object} data - Dados a enviar
   * @returns {Promise} Resposta da API
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trata erros de requisição
   * @param {Error} error - Erro capturado
   * @returns {object} Objeto de erro formatado
   */
  handleError(error) {
    const errorResponse = {
      message: error.message,
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    return new Error(JSON.stringify(errorResponse));
  }
}

module.exports = new NFSeHttpClient();
