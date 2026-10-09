const mongoose = require('mongoose');

const varianteSchema = new mongoose.Schema({
  tipo: { type: String, default: 'Genérico' },      // Genérico | Triple A | Original
  presentacion: { type: String, required: true },   // Ej. "100 ml"
  costo: { type: Number, required: true, min: 0 },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 }
});

const esenciaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  familia: { type: String },
  probador: { type: Boolean, default: false },
  variantes: [varianteSchema]
}, { timestamps: true });

module.exports = mongoose.model('Esencia', esenciaSchema);