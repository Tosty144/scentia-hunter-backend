require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? undefined : './atlas-credentials.env' });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
  });
});

module.exports = app;