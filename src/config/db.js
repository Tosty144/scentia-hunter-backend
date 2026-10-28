const mongoose = require('mongoose');

let connecting = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (connecting) return connecting;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI no está definida en las variables de entorno');
    return;
  }

  connecting = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('MongoDB Conectado'))
    .catch((error) => console.error('Error conectando a MongoDB:', error.message))
    .finally(() => {
      connecting = null;
    });

  return connecting;
};

module.exports = connectDB;