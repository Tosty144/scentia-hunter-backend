const express = require('express');
const router = express.Router();
const controller = require('../controllers/esencias.controller');

router.get('/', controller.listarEsencias);
router.get('/probadores', controller.probadores);
router.get('/:id', controller.obtenerEsencia);
router.post('/', controller.crearEsencia);
router.put('/:id', controller.actualizarEsencia);
router.delete('/:id', controller.eliminarEsencia);

// Rutas de variantes según api.js
router.post('/:id/variantes', controller.agregarVariante);
router.put('/:id/variantes/:varianteId', controller.actualizarVariante);

module.exports = router;