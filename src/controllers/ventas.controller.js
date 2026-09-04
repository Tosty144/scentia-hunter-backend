const Venta = require('../models/Venta');
const Esencia = require('../models/Esencia');

exports.registrarVenta = async (req, res) => {
  try {
    const { items, total, cliente } = req.body;
    const venta = new Venta({ items, total, cliente });
    await venta.save();

    // Descontar stock por cada item vendido
    for (const item of items) {
      await Esencia.updateOne(
        { _id: item.esenciaId, "variantes._id": item.varianteId },
        { $inc: { "variantes.$.stock": -item.cantidad } }
      );
    }

    res.status(201).json(venta);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar venta' });
  }
};

exports.listarVentas = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let filtro = {};
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(hasta);
    }
    const ventas = await Venta.find(filtro).sort({ fecha: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar ventas' });
  }
};