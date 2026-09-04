const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Diagnóstico base
app.get('/', (req, res) => {
  res.json({ message: 'API Scentia Hunter lista y desplegada' });
});

// Enlace de Rutas
app.use('/api/esencias', require('./routes/esencias.routes'));

module.exports = app;