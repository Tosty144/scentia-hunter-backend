const mongoose = require('mongoose');

const varianteSchema = new mongoose.Schema({
  mililitros: { type: Number, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  esProbador: { type: Boolean, default: false }
});

const esenciaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  familiaOlfativa: { type: String },
  casaFragancia: { type: String },
  descripcion: { type: String },
  variantes: [varianteSchema]
}, { timestamps: true });

module.exports = mongoose.model('Esencia', esenciaSchema);