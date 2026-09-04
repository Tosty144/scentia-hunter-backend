// Cargar variables locales únicamente si NO estamos en entorno de producción (Vercel)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './atlas-credentials.env' });
}

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Iniciar conexión a la base de datos
connectDB();

const PORT = process.env.PORT || 5000;

// En entorno local (desarrollo) iniciamos el servidor HTTP
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose localmente en el puerto ${PORT}`);
  });
}

// Exportar la instancia de Express requerida por el runner Serverless de Vercel
module.exports = app;