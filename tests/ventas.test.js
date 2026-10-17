jest.mock('../src/config/db', () => jest.fn());
jest.mock('../src/models/Esencia', () => require('./helpers/mockModel')());
jest.mock('../src/models/Venta', () => require('./helpers/mockModel')());

const request = require('supertest');
const app = require('../src/app');
const Esencia = require('../src/models/Esencia');
const Venta = require('../src/models/Venta');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('POST /api/ventas', () => {
  const cuerpo = {
    cliente: 'Ana',
    total: 380,
    items: [
      { esenciaId: 'e1', varianteId: 'v1', cantidad: 2, precioUnitario: 150 },
      { esenciaId: 'e2', varianteId: 'v3', cantidad: 1, precioUnitario: 80 },
    ],
  };

  it('registra la venta y descuenta el stock de cada item', async () => {
    const guardar = jest.fn().mockResolvedValue();
    Venta.mockImplementation(function (datos) {
      Object.assign(this, datos);
      this.save = guardar;
    });
    Esencia.updateOne.mockResolvedValue({});

    const res = await request(app).post('/api/ventas').send(cuerpo);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ cliente: 'Ana', total: 380 });
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(Esencia.updateOne).toHaveBeenCalledTimes(2);
    expect(Esencia.updateOne).toHaveBeenNthCalledWith(
      1,
      { _id: 'e1', 'variantes._id': 'v1' },
      { $inc: { 'variantes.$.stock': -2 } }
    );
    expect(Esencia.updateOne).toHaveBeenNthCalledWith(
      2,
      { _id: 'e2', 'variantes._id': 'v3' },
      { $inc: { 'variantes.$.stock': -1 } }
    );
  });

  it('responde 400 si no se puede guardar la venta', async () => {
    Venta.mockImplementation(function () {
      this.save = jest.fn().mockRejectedValue(new Error('fallo'));
    });
    const res = await request(app).post('/api/ventas').send(cuerpo);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al registrar venta' });
    expect(Esencia.updateOne).not.toHaveBeenCalled();
  });
});

describe('GET /api/ventas', () => {
  function simularConsulta(resultado) {
    const sort = jest.fn().mockResolvedValue(resultado);
    Venta.find.mockReturnValue({ sort });
    return sort;
  }

  it('lista todas las ventas sin filtro', async () => {
    const sort = simularConsulta([{ total: 100 }]);
    const res = await request(app).get('/api/ventas');
    expect(res.status).toBe(200);
    expect(Venta.find).toHaveBeenCalledWith({});
    expect(sort).toHaveBeenCalledWith({ fecha: -1 });
    expect(res.body).toEqual([{ total: 100 }]);
  });

  it('filtra por rango de fechas', async () => {
    simularConsulta([]);
    await request(app).get('/api/ventas?desde=2026-01-01&hasta=2026-01-31');
    expect(Venta.find).toHaveBeenCalledWith({
      fecha: { $gte: new Date('2026-01-01'), $lte: new Date('2026-01-31') },
    });
  });

  it('filtra solo desde una fecha', async () => {
    simularConsulta([]);
    await request(app).get('/api/ventas?desde=2026-01-01');
    expect(Venta.find).toHaveBeenCalledWith({ fecha: { $gte: new Date('2026-01-01') } });
  });

  it('filtra solo hasta una fecha', async () => {
    simularConsulta([]);
    await request(app).get('/api/ventas?hasta=2026-01-31');
    expect(Venta.find).toHaveBeenCalledWith({ fecha: { $lte: new Date('2026-01-31') } });
  });

  it('responde 500 si falla la consulta', async () => {
    Venta.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('fallo')) });
    const res = await request(app).get('/api/ventas');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al listar ventas' });
  });
});
