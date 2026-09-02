require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? undefined : './atlas-credentials.env' });
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Conectar a MongoDB Atlas
connectDB();

const PORT = process.env.PORT || 5000;

// En entorno local arranca el puerto; en Vercel solo exporta app
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
  });
}

module.exports = app;