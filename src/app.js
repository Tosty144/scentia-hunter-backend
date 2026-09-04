const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Conectar a MongoDB Atlas en cada invocation serverless
connectDB();

app.use(cors());
app.use(express.json());

// Diagnóstico base
app.get('/', (req, res) => {
  res.json({ message: 'API Scentia Hunter lista y desplegada' });
});

// Enrutamiento coincidente con tu api.js
app.use('/api/esencias', require('./routes/esencias.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/analisis', require('./routes/analisis.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

module.exports = app;