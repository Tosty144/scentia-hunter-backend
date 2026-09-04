const Esencia = require('../models/Esencia');

exports.listarEsencias = async (req, res) => {
  try {
    const esencias = await Esencia.find();
    res.json(esencias);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar esencias' });
  }
};

exports.obtenerEsencia = async (req, res) => {
  try {
    const esencia = await Esencia.findById(req.params.id);
    if (!esencia) return res.status(404).json({ error: 'Esencia no encontrada' });
    res.json(esencia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener esencia' });
  }
};

exports.crearEsencia = async (req, res) => {
  try {
    const nueva = new Esencia(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear esencia' });
  }
};

exports.actualizarEsencia = async (req, res) => {
  try {
    const actualizada = await Esencia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar esencia' });
  }
};

exports.eliminarEsencia = async (req, res) => {
  try {
    await Esencia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Esencia eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar esencia' });
  }
};

exports.obtenerProbadores = async (req, res) => {
  try {
    const esencias = await Esencia.find({ "variantes.esProbador": true });
    res.json(esencias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener probadores' });
  }
};