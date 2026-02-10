const express = require('express');
const multer = require('multer');
const certificadosController = require('../controllers/certificadosController');

const router = express.Router();

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas arquivos PFX
    if (file.mimetype === 'application/x-pkcs12' || file.originalname.endsWith('.pfx')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PFX são aceitos'), false);
    }
  },
});

/**
 * Rotas de Certificados
 * Base: /api/certificados
 */

// POST /api/certificados/upload - Fazer upload de certificado
router.post('/upload', upload.single('certificado'), certificadosController.upload.bind(certificadosController));

// POST /api/certificados/validar - Validar certificado sem salvar
router.post('/validar', upload.single('certificado'), certificadosController.validar.bind(certificadosController));

// GET /api/certificados/empresa/:empresaId - Listar certificados de uma empresa
router.get('/empresa/:empresaId', certificadosController.listarPorEmpresa.bind(certificadosController));

// GET /api/certificados/:id - Obter detalhes de um certificado
router.get('/:id', certificadosController.obter.bind(certificadosController));

// DELETE /api/certificados/:id - Deletar um certificado
router.delete('/:id', certificadosController.deletar.bind(certificadosController));

module.exports = router;
