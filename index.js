require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         NFSe Nacional API Backend                          ║
║                                                            ║
║  Servidor iniciado com sucesso!                           ║
║  Porta: ${PORT}                                                ║
║  Ambiente: ${NODE_ENV}                                      ║
║  URL: http://localhost:${PORT}                               ║
║                                                            ║
║  Endpoints disponíveis:                                   ║
║  - GET  /health                                           ║
║  - GET  /api/notas/emitidas                               ║
║  - GET  /api/notas/recebidas                              ║
║  - GET  /api/notas/:numeroNota                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

/**
 * Tratamento de sinais de encerramento
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
