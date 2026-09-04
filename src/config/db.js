const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
};

module.exports = connectDB;