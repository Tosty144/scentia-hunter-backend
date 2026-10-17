jest.mock('../src/config/db', () => jest.fn());

const request = require('supertest');
const connectDB = require('../src/config/db');
const app = require('../src/app');

describe('app', () => {
  it('intenta conectar a la base de datos al iniciar', () => {
    expect(connectDB).toHaveBeenCalledTimes(1);
  });

  it('GET / responde que la API está lista', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'API Scentia Hunter lista y desplegada' });
  });

  it('permite peticiones desde cualquier origen (CORS)', async () => {
    const res = await request(app).get('/').set('Origin', 'https://otro-sitio.com');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('responde 404 en una ruta que no existe', async () => {
    const res = await request(app).get('/ruta-inexistente');
    expect(res.status).toBe(404);
  });
});
