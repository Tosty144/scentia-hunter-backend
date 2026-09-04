const express = require('express');
const router = express.Router();
const controller = require('../controllers/esencias.controller');

router.get('/', controller.listarEsencias);
router.get('/probadores', controller.obtenerProbadores);
router.get('/:id', controller.obtenerEsencia);
router.post('/', controller.crearEsencia);
router.put('/:id', controller.actualizarEsencia);
router.delete('/:id', controller.eliminarEsencia);

module.exports = router;