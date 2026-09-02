require('dotenv').config({ path: './atlas-credentials.env' });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Scentia Hunter API corriendo en http://localhost:${PORT}`);
    console.log(`📄 Documentación Swagger en http://localhost:${PORT}/api-docs`);
  });
});