const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['ENTRADA', 'SALIDA'], required: true },
  esenciaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Esencia', required: true },
  varianteId: { type: String, required: true },
  cantidad: { type: Number, required: true },
  motivo: { type: String },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);