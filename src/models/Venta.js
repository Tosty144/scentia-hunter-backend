const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema({
  esenciaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Esencia', required: true },
  varianteId: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true }
});

const ventaSchema = new mongoose.Schema({
  items: [itemVentaSchema],
  total: { type: Number, required: true },
  cliente: { type: String },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Venta', ventaSchema);