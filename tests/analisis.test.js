jest.mock('../src/config/db', () => jest.fn());
jest.mock('../src/models/Esencia', () => require('./helpers/mockModel')());
jest.mock('../src/models/Venta', () => require('./helpers/mockModel')());

const request = require('supertest');
const app = require('../src/app');
const Esencia = require('../src/models/Esencia');
const Venta = require('../src/models/Venta');

const DIA = 24 * 60 * 60 * 1000;

// Datos de ejemplo: 2 esencias con 3 variantes y una venta de 2 productos.
function crearEsencias() {
  return [
    {
      _id: 'e1',
      nombre: 'Dior Sauvage',
      variantes: [
        { _id: 'v1', presentacion: '100ml', tipo: 'Original', stock: 0, costo: 100 },
        { _id: 'v2', presentacion: '30ml', tipo: 'Genérico', stock: 10, costo: 20 },
      ],
    },
    {
      _id: 'e2',
      nombre: 'Khamra',
      variantes: [{ _id: 'v3', presentacion: '100ml', tipo: 'Genérico', stock: 2, costo: 30 }],
    },
  ];
}

function crearVentas(fecha = new Date()) {
  return [
    {
      fecha,
      total: 380,
      items: [
        { esenciaId: 'e1', varianteId: 'v1', cantidad: 2, precioUnitario: 150 },
        { esenciaId: 'e2', varianteId: 'v3', cantidad: 1, precioUnitario: 80 },
      ],
    },
  ];
}

function prepararDatos(esencias, ventas) {
  Esencia.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(esencias) });
  Venta.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(ventas) });
}

function simularFalla() {
  Esencia.find.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('fallo')) });
  Venta.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /api/dashboard', () => {
  it('calcula inventario, inversión, ingresos y ganancia', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'OK',
      totalEsencias: 2,
      totalVentas: 1,
      inventarioDisponible: 12, // 0 + 10 + 2
      inversionTotal: 490, // stock (20*10 + 30*2) + costo vendido (200 + 30)
      ingresoTotal: 380,
      gananciaTotal: 150, // 380 - 230
    });
  });

  it('devuelve los más vendidos ordenados por cantidad', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/dashboard');

    expect(res.body.masVendidos).toEqual([
      { producto: 'Dior Sauvage', variante: '100ml', cantidad: 2, ganancia: 100 },
      { producto: 'Khamra', variante: '100ml', cantidad: 1, ganancia: 50 },
    ]);
  });

  it('lista las variantes con bajo stock (umbral por defecto 5), de menor a mayor', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/dashboard');

    expect(res.body.bajoStock).toEqual([
      { esencia: 'Dior Sauvage', tipo: 'Original', presentacion: '100ml', stock: 0 },
      { esencia: 'Khamra', tipo: 'Genérico', presentacion: '100ml', stock: 2 },
    ]);
  });

  it('usa el umbral recibido por query', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/dashboard?umbral=1');

    expect(res.body.bajoStock).toHaveLength(1);
    expect(res.body.bajoStock[0].esencia).toBe('Dior Sauvage');
  });

  it('maneja datos incompletos (sin variantes, sin items, sin total)', async () => {
    prepararDatos(
      [{ _id: 'e1', nombre: 'Sin variantes' }, { _id: 'e2', nombre: 'Incompleta', variantes: [{ _id: 'v1', presentacion: '50ml', tipo: 'Genérico' }] }],
      [{ fecha: new Date() }]
    );
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalEsencias: 2,
      inventarioDisponible: 0,
      inversionTotal: 0,
      ingresoTotal: 0,
      gananciaTotal: 0,
      masVendidos: [],
    });
    expect(res.body.bajoStock).toHaveLength(1);
  });

  it('responde 500 si falla la consulta', async () => {
    simularFalla();
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener dashboard' });
  });
});

describe('GET /api/analisis/ranking', () => {
  it('devuelve los productos vendidos con ingreso, costo y ganancia', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/analisis/ranking');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { producto: 'Dior Sauvage', variante: '100ml', cantidad: 2, ingreso: 300, costo: 200, ganancia: 100 },
      { producto: 'Khamra', variante: '100ml', cantidad: 1, ingreso: 80, costo: 30, ganancia: 50 },
    ]);
  });

  it('marca como "Producto eliminado" las ventas de variantes que ya no existen', async () => {
    prepararDatos(crearEsencias(), [
      { fecha: new Date(), total: 10, items: [{ esenciaId: 'e9', varianteId: 'v9', cantidad: 1, precioUnitario: 10 }] },
    ]);
    const res = await request(app).get('/api/analisis/ranking');

    expect(res.body).toEqual([
      { producto: 'Producto eliminado', variante: '-', cantidad: 1, ingreso: 10, costo: 0, ganancia: 10 },
    ]);
  });

  it('acumula las cantidades de varias ventas de la misma variante', async () => {
    const ventas = [
      { fecha: new Date(), total: 150, items: [{ esenciaId: 'e1', varianteId: 'v1', cantidad: 1, precioUnitario: 150 }] },
      { fecha: new Date(), total: 150, items: [{ esenciaId: 'e1', varianteId: 'v1', cantidad: 1, precioUnitario: 150 }] },
    ];
    prepararDatos(crearEsencias(), ventas);
    const res = await request(app).get('/api/analisis/ranking');

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ cantidad: 2, ingreso: 300 });
  });

  it('responde 500 si falla la consulta', async () => {
    simularFalla();
    const res = await request(app).get('/api/analisis/ranking');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener ranking' });
  });
});

describe('GET /api/analisis/sin-movimiento', () => {
  it('lista las variantes con stock que no se han vendido en 30 días', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/analisis/sin-movimiento');

    // v1 sin stock (excluida), v3 vendida hoy (excluida), v2 nunca vendida (incluida)
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ esencia: 'Dior Sauvage', tipo: 'Genérico', presentacion: '30ml', stock: 10 }]);
  });

  it('incluye las variantes cuya última venta es anterior al límite de días', async () => {
    prepararDatos(crearEsencias(), crearVentas(new Date(Date.now() - 100 * DIA)));
    const res = await request(app).get('/api/analisis/sin-movimiento');

    expect(res.body.map((f) => f.presentacion)).toEqual(['30ml', '100ml']);
  });

  it('usa el parámetro dias recibido por query', async () => {
    prepararDatos(crearEsencias(), crearVentas(new Date(Date.now() - 10 * DIA)));
    const res = await request(app).get('/api/analisis/sin-movimiento?dias=5');

    expect(res.body.map((f) => f.esencia)).toEqual(['Dior Sauvage', 'Khamra']);
  });

  it('responde 500 si falla la consulta', async () => {
    simularFalla();
    const res = await request(app).get('/api/analisis/sin-movimiento');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al consultar productos sin movimiento' });
  });
});

describe('GET /api/analisis/rentabilidad', () => {
  it('calcula el margen y ordena por ganancia', async () => {
    prepararDatos(crearEsencias(), crearVentas());
    const res = await request(app).get('/api/analisis/rentabilidad');

    expect(res.status).toBe(200);
    expect(res.body.map((f) => [f.producto, f.ganancia, f.margen])).toEqual([
      ['Dior Sauvage', 100, 33],
      ['Khamra', 50, 63],
    ]);
  });

  it('el margen es 0 cuando el ingreso es 0', async () => {
    prepararDatos(crearEsencias(), [
      { fecha: new Date(), total: 0, items: [{ esenciaId: 'e1', varianteId: 'v1', cantidad: 1, precioUnitario: 0 }] },
    ]);
    const res = await request(app).get('/api/analisis/rentabilidad');

    expect(res.body[0]).toMatchObject({ ingreso: 0, ganancia: -100, margen: 0 });
  });

  it('responde 500 si falla el cálculo', async () => {
    simularFalla();
    const res = await request(app).get('/api/analisis/rentabilidad');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al calcular rentabilidad' });
  });
});
