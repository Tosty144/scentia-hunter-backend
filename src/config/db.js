const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Reutilizar la conexión si ya existe en memoria
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🟢 MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 Error de conexión a MongoDB: ${error.message}`);
    // OJO: No pongas process.exit(1) aquí en Vercel
  }
};

module.exports = connectDB;