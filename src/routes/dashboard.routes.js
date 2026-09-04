const express = require('express');
const router = express.Router();
const controller = require('../controllers/analisis.controller');

router.get('/', controller.obtenerDashboard);

module.exports = router;