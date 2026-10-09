require('dotenv').config({ path: process.env.VERCEL ? undefined : './atlas-credentials.env' });
const app = require('./src/app');
const connectDB = require('./src/config/db');

connectDB();

const PORT = process.env.PORT || 5000;

// Solo Vercel exporta sin escuchar puerto; Azure App Service SÍ necesita app.listen()
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
  });
}

module.exports = app;