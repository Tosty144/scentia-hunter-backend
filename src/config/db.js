const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  console.log('DIAG uri definida:', Boolean(uri), '| empieza con:', uri ? uri.slice(0, 14) : 'n/a', '| host:', uri ? uri.split('@')[1]?.split('/')[0] : 'n/a');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
};

module.exports = connectDB;