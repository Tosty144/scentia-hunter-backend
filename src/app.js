const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API Scentia Hunter desplegada en Vercel' });
});

// — Configuración de Rutas de la API —
// Ajusta las rutas relativas ('./routes/...') si tus archivos están en otra carpeta
app.use('/api/esencias', require('./routes/esencias.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/analisis', require('./routes/analisis.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

module.exports = app;