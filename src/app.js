const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const notasRoutes = require('./routes/notasRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/**
 * Middleware de segurança e parsing
 */
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware de logging
 */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Rotas da API
 */
app.use('/api/notas', notasRoutes);
app.use('/api/empresas', empresasRoutes);

/**
 * Rota de health check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * Rota raiz com informações da API
 */
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'NFSe Nacional API Backend',
    version: '1.0.0',
    description: 'Backend para integração com API NFSe Nacional',
    endpoints: {
      health: '/health',
      notasEmitidas: '/api/notas/emitidas',
      notasRecebidas: '/api/notas/recebidas',
      detalhesNota: '/api/notas/:numeroNota',
      empresas: '/api/empresas',
      empresasAtivas: '/api/empresas/ativas',
      empresaPorId: '/api/empresas/:id',
      empresaPorCNPJ: '/api/empresas/cnpj/:cnpj',
    },
  });
});

/**
 * Rota 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

/**
 * Middleware de tratamento de erros
 */
app.use(errorHandler);

module.exports = app;
