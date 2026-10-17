jest.mock('mongoose', () => ({
  connection: { readyState: 0 },
  connect: jest.fn(),
}));

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

describe('connectDB', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mongoose.connection.readyState = 0;
    process.env.MONGODB_URI = 'mongodb+srv://usuario:clave@cluster0.ejemplo.mongodb.net/scentia';
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('no se reconecta si ya hay una conexión activa', async () => {
    mongoose.connection.readyState = 1;
    await connectDB();
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('conecta usando la variable MONGODB_URI', async () => {
    mongoose.connect.mockResolvedValue();
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);
  });

  it('no lanza error si la conexión falla, solo lo registra', async () => {
    mongoose.connect.mockRejectedValue(new Error('fallo de red'));
    await expect(connectDB()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('intenta conectar aunque MONGODB_URI no esté definida', async () => {
    delete process.env.MONGODB_URI;
    mongoose.connect.mockResolvedValue();
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(undefined);
  });
});
