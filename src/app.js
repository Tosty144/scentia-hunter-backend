const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Diagnóstico base
app.get('/', (req, res) => {
  res.json({ message: 'API Scentia Hunter desplegada y lista en Vercel' });
});

// — Registro Global de Rutas de la API —
app.use('/api/esencias', require('./routes/esencias.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/analisis', require('./routes/analisis.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

module.exports = app;