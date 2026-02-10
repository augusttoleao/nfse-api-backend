/**
 * Middleware de tratamento de erros global
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro não tratado:', err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

module.exports = errorHandler;
