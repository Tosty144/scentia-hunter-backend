const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventario.controller');

router.post('/entradas', controller.registrarEntrada);
router.post('/salidas', controller.registrarSalida);
router.get('/movimientos', controller.obtenerMovimientos);
router.get('/bajo-stock', controller.obtenerBajoStock);
router.get('/inversion', controller.obtenerInversion);

module.exports = router;