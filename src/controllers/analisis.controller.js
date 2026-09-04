const Venta = require('../models/Venta');
const Esencia = require('../models/Esencia');

exports.obtenerDashboard = async (req, res) => {
  try {
    const totalEsencias = await Esencia.countDocuments();
    const totalVentas = await Venta.countDocuments();
    res.json({ totalEsencias, totalVentas, status: 'OK' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

exports.obtenerRanking = async (req, res) => {
  try {
    const esencias = await Esencia.find().limit(5);
    res.json(esencias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
};

exports.obtenerSinMovimiento = async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar productos sin movimiento' });
  }
};

exports.obtenerRentabilidad = async (req, res) => {
  try {
    res.json({ margenEstimado: '35%' });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular rentabilidad' });
  }
};