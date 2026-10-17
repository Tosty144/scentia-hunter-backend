jest.mock('../src/config/db', () => jest.fn());
jest.mock('../src/models/Esencia', () => require('./helpers/mockModel')());

const request = require('supertest');
const app = require('../src/app');
const Esencia = require('../src/models/Esencia');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('GET /api/esencias', () => {
  it('lista las esencias', async () => {
    Esencia.find.mockResolvedValue([{ nombre: 'Khamra' }]);
    const res = await request(app).get('/api/esencias');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ nombre: 'Khamra' }]);
  });

  it('responde 500 si falla la consulta', async () => {
    Esencia.find.mockRejectedValue(new Error('fallo'));
    const res = await request(app).get('/api/esencias');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al listar esencias' });
  });
});

describe('GET /api/esencias/probadores', () => {
  it('filtra las esencias que tienen probador', async () => {
    Esencia.find.mockResolvedValue([{ nombre: 'Dior Sauvage', probador: true }]);
    const res = await request(app).get('/api/esencias/probadores');
    expect(res.status).toBe(200);
    expect(Esencia.find).toHaveBeenCalledWith({ probador: true });
    expect(res.body).toHaveLength(1);
  });

  it('responde 500 si falla la consulta', async () => {
    Esencia.find.mockRejectedValue(new Error('fallo'));
    const res = await request(app).get('/api/esencias/probadores');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener probadores' });
  });
});

describe('GET /api/esencias/:id', () => {
  it('devuelve la esencia encontrada', async () => {
    Esencia.findById.mockResolvedValue({ nombre: 'Khamra' });
    const res = await request(app).get('/api/esencias/e1');
    expect(res.status).toBe(200);
    expect(Esencia.findById).toHaveBeenCalledWith('e1');
    expect(res.body).toEqual({ nombre: 'Khamra' });
  });

  it('responde 404 si no existe', async () => {
    Esencia.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/esencias/e1');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Esencia no encontrada' });
  });

  it('responde 500 si falla la consulta', async () => {
    Esencia.findById.mockRejectedValue(new Error('fallo'));
    const res = await request(app).get('/api/esencias/e1');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener esencia' });
  });
});

describe('POST /api/esencias', () => {
  it('crea la esencia y responde 201', async () => {
    const guardar = jest.fn().mockResolvedValue();
    Esencia.mockImplementation(function (datos) {
      Object.assign(this, datos);
      this.save = guardar;
    });
    const res = await request(app).post('/api/esencias').send({ nombre: 'Khamra', familia: 'Oriental' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ nombre: 'Khamra', familia: 'Oriental' });
    expect(guardar).toHaveBeenCalledTimes(1);
  });

  it('responde 400 si no se puede guardar', async () => {
    Esencia.mockImplementation(function () {
      this.save = jest.fn().mockRejectedValue(new Error('inválida'));
    });
    const res = await request(app).post('/api/esencias').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al crear esencia' });
  });
});

describe('PUT /api/esencias/:id', () => {
  it('actualiza la esencia', async () => {
    Esencia.findByIdAndUpdate.mockResolvedValue({ nombre: 'Nuevo nombre' });
    const res = await request(app).put('/api/esencias/e1').send({ nombre: 'Nuevo nombre' });
    expect(res.status).toBe(200);
    expect(Esencia.findByIdAndUpdate).toHaveBeenCalledWith('e1', { nombre: 'Nuevo nombre' }, { new: true });
    expect(res.body).toEqual({ nombre: 'Nuevo nombre' });
  });

  it('responde 400 si falla la actualización', async () => {
    Esencia.findByIdAndUpdate.mockRejectedValue(new Error('fallo'));
    const res = await request(app).put('/api/esencias/e1').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al actualizar esencia' });
  });
});

describe('DELETE /api/esencias/:id', () => {
  it('elimina la esencia', async () => {
    Esencia.findByIdAndDelete.mockResolvedValue({});
    const res = await request(app).delete('/api/esencias/e1');
    expect(res.status).toBe(200);
    expect(Esencia.findByIdAndDelete).toHaveBeenCalledWith('e1');
    expect(res.body).toEqual({ message: 'Esencia eliminada correctamente' });
  });

  it('responde 500 si falla la eliminación', async () => {
    Esencia.findByIdAndDelete.mockRejectedValue(new Error('fallo'));
    const res = await request(app).delete('/api/esencias/e1');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al eliminar esencia' });
  });
});

describe('POST /api/esencias/:id/variantes', () => {
  const variante = { tipo: 'Triple A', presentacion: '100ml', costo: 40, precio: 90 };

  it('agrega la variante y responde 201', async () => {
    const esencia = { variantes: [], save: jest.fn().mockResolvedValue() };
    Esencia.findById.mockResolvedValue(esencia);
    const res = await request(app).post('/api/esencias/e1/variantes').send(variante);
    expect(res.status).toBe(201);
    expect(esencia.variantes).toEqual([variante]);
    expect(esencia.save).toHaveBeenCalledTimes(1);
  });

  it('responde 404 si la esencia no existe', async () => {
    Esencia.findById.mockResolvedValue(null);
    const res = await request(app).post('/api/esencias/e1/variantes').send(variante);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Esencia no encontrada' });
  });

  it('responde 400 si falla al guardar', async () => {
    Esencia.findById.mockRejectedValue(new Error('fallo'));
    const res = await request(app).post('/api/esencias/e1/variantes').send(variante);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al agregar variante' });
  });
});

describe('PUT /api/esencias/:id/variantes/:varianteId', () => {
  it('actualiza la variante indicada', async () => {
    const variante = { stock: 1 };
    const esencia = {
      variantes: { id: jest.fn().mockReturnValue(variante) },
      save: jest.fn().mockResolvedValue(),
    };
    Esencia.findById.mockResolvedValue(esencia);
    const res = await request(app).put('/api/esencias/e1/variantes/v1').send({ stock: 9 });
    expect(res.status).toBe(200);
    expect(esencia.variantes.id).toHaveBeenCalledWith('v1');
    expect(variante.stock).toBe(9);
    expect(esencia.save).toHaveBeenCalledTimes(1);
  });

  it('responde 404 si la esencia no existe', async () => {
    Esencia.findById.mockResolvedValue(null);
    const res = await request(app).put('/api/esencias/e1/variantes/v1').send({ stock: 9 });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Esencia no encontrada' });
  });

  it('responde 404 si la variante no existe', async () => {
    Esencia.findById.mockResolvedValue({ variantes: { id: jest.fn().mockReturnValue(undefined) } });
    const res = await request(app).put('/api/esencias/e1/variantes/v1').send({ stock: 9 });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Variante no encontrada' });
  });

  it('responde 400 si falla la actualización', async () => {
    Esencia.findById.mockRejectedValue(new Error('fallo'));
    const res = await request(app).put('/api/esencias/e1/variantes/v1').send({ stock: 9 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al actualizar variante' });
  });
});
