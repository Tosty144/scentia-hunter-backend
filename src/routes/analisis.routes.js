const express = require('express');
const router = express.Router();
const controller = require('../controllers/analisis.controller');

router.get('/ranking', controller.obtenerRanking);
router.get('/sin-movimiento', controller.obtenerSinMovimiento);
router.get('/rentabilidad', controller.obtenerRentabilidad);

module.exports = router;