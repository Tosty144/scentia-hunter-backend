jest.mock('../src/config/db', () => jest.fn());
jest.mock('../src/models/Esencia', () => require('./helpers/mockModel')());
jest.mock('../src/models/Inventario', () => require('./helpers/mockModel')());

const request = require('supertest');
const app = require('../src/app');
const Esencia = require('../src/models/Esencia');
const Movimiento = require('../src/models/Inventario');

function simularMovimiento(guardar) {
  Movimiento.mockImplementation(function (datos) {
    Object.assign(this, datos);
    this.save = guardar;
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('POST /api/inventario/entradas', () => {
  const cuerpo = { esenciaId: 'e1', varianteId: 'v1', cantidad: 5, motivo: 'compra' };

  it('registra la entrada y suma el stock', async () => {
    const guardar = jest.fn().mockResolvedValue();
    simularMovimiento(guardar);
    Esencia.updateOne.mockResolvedValue({});
    const res = await request(app).post('/api/inventario/entradas').send(cuerpo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ tipo: 'ENTRADA', cantidad: 5, motivo: 'compra' });
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(Esencia.updateOne).toHaveBeenCalledWith(
      { _id: 'e1', 'variantes._id': 'v1' },
      { $inc: { 'variantes.$.stock': 5 } }
    );
  });

  it('responde 400 si no se puede registrar', async () => {
    simularMovimiento(jest.fn().mockRejectedValue(new Error('fallo')));
    const res = await request(app).post('/api/inventario/entradas').send(cuerpo);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al registrar entrada de inventario' });
    expect(Esencia.updateOne).not.toHaveBeenCalled();
  });
});

describe('POST /api/inventario/salidas', () => {
  const cuerpo = { esenciaId: 'e1', varianteId: 'v1', cantidad: 3, motivo: 'probador' };

  it('registra la salida y resta el stock', async () => {
    const guardar = jest.fn().mockResolvedValue();
    simularMovimiento(guardar);
    Esencia.updateOne.mockResolvedValue({});
    const res = await request(app).post('/api/inventario/salidas').send(cuerpo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ tipo: 'SALIDA', cantidad: 3 });
    expect(Esencia.updateOne).toHaveBeenCalledWith(
      { _id: 'e1', 'variantes._id': 'v1' },
      { $inc: { 'variantes.$.stock': -3 } }
    );
  });

  it('responde 400 si no se puede registrar', async () => {
    simularMovimiento(jest.fn().mockRejectedValue(new Error('fallo')));
    const res = await request(app).post('/api/inventario/salidas').send(cuerpo);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al registrar salida de inventario' });
  });
});

describe('GET /api/inventario/movimientos', () => {
  it('lista los movimientos ordenados por fecha descendente', async () => {
    const sort = jest.fn().mockResolvedValue([{ tipo: 'ENTRADA' }]);
    const populate = jest.fn().mockReturnValue({ sort });
    Movimiento.find.mockReturnValue({ populate });
    const res = await request(app).get('/api/inventario/movimientos');
    expect(res.status).toBe(200);
    expect(populate).toHaveBeenCalledWith('esenciaId');
    expect(sort).toHaveBeenCalledWith({ fecha: -1 });
    expect(res.body).toEqual([{ tipo: 'ENTRADA' }]);
  });

  it('responde 500 si falla la consulta', async () => {
    const sort = jest.fn().mockRejectedValue(new Error('fallo'));
    Movimiento.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort }) });
    const res = await request(app).get('/api/inventario/movimientos');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener movimientos' });
  });
});

describe('GET /api/inventario/bajo-stock', () => {
  it('consulta las variantes con stock menor o igual a 5', async () => {
    Esencia.find.mockResolvedValue([{ nombre: 'Khamra' }]);
    const res = await request(app).get('/api/inventario/bajo-stock');
    expect(res.status).toBe(200);
    expect(Esencia.find).toHaveBeenCalledWith({ 'variantes.stock': { $lte: 5 } });
    expect(res.body).toEqual([{ nombre: 'Khamra' }]);
  });

  it('responde 500 si falla la consulta', async () => {
    Esencia.find.mockRejectedValue(new Error('fallo'));
    const res = await request(app).get('/api/inventario/bajo-stock');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener productos bajo stock' });
  });
});

describe('GET /api/inventario/inversion', () => {
  it('suma precio por stock de todas las variantes', async () => {
    Esencia.find.mockResolvedValue([
      { variantes: [{ precio: 10, stock: 2 }, { precio: 5, stock: 3 }] },
      { variantes: [{ stock: 4 }, { precio: 7 }] }, // sin precio o sin stock suman 0
    ]);
    const res = await request(app).get('/api/inventario/inversion');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalInversion: 35 });
  });

  it('responde 500 si falla la consulta', async () => {
    Esencia.find.mockRejectedValue(new Error('fallo'));
    const res = await request(app).get('/api/inventario/inversion');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al calcular inversión' });
  });
});
