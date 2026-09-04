const Movimiento = require('../models/Inventario');
const Esencia = require('../models/Esencia');

exports.registrarEntrada = async (req, res) => {
  try {
    const { esenciaId, varianteId, cantidad, motivo } = req.body;
    const movimiento = new Movimiento({ tipo: 'ENTRADA', esenciaId, varianteId, cantidad, motivo });
    await movimiento.save();

    // Actualizar stock de la variante
    await Esencia.updateOne(
      { _id: esenciaId, "variantes._id": varianteId },
      { $inc: { "variantes.$.stock": cantidad } }
    );

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar entrada de inventario' });
  }
};

exports.registrarSalida = async (req, res) => {
  try {
    const { esenciaId, varianteId, cantidad, motivo } = req.body;
    const movimiento = new Movimiento({ tipo: 'SALIDA', esenciaId, varianteId, cantidad, motivo });
    await movimiento.save();

    // Reducir stock de la variante
    await Esencia.updateOne(
      { _id: esenciaId, "variantes._id": varianteId },
      { $inc: { "variantes.$.stock": -cantidad } }
    );

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar salida de inventario' });
  }
};

exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.find().populate('esenciaId').sort({ fecha: -1 });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

exports.obtenerBajoStock = async (req, res) => {
  try {
    const esencias = await Esencia.find({ "variantes.stock": { $lte: 5 } });
    res.json(esencias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos bajo stock' });
  }
};

exports.obtenerInversion = async (req, res) => {
  try {
    const esencias = await Esencia.find();
    let totalInversion = 0;
    esencias.forEach(e => {
      e.variantes.forEach(v => {
        totalInversion += (v.precio || 0) * (v.stock || 0);
      });
    });
    res.json({ totalInversion });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular inversión' });
  }
};