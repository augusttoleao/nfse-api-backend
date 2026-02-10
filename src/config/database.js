const sql = require('mssql');

/**
 * Configuração de conexão com Azure SQL Database
 * Usa variáveis de ambiente do .env
 */

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
    connectionTimeout: 15000,
    requestTimeout: 15000,
  },
};

let pool = null;

/**
 * Obter pool de conexão
 * @returns {Promise<sql.ConnectionPool>}
 */
async function getPool() {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Conectado ao Azure SQL Database com sucesso');
    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar ao Azure SQL Database:', error.message);
    throw error;
  }
}

/**
 * Executar query no banco de dados
 * @param {string} query - Query SQL
 * @param {Object} params - Parâmetros da query
 * @returns {Promise<Array>} Resultado da query
 */
async function executeQuery(query, params = {}) {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Adicionar parâmetros à query
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error.message);
    throw error;
  }
}

/**
 * Fechar conexão com o banco
 */
async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      console.log('✅ Conexão com banco de dados fechada');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error.message);
  }
}

module.exports = {
  getPool,
  executeQuery,
  closeConnection,
};
