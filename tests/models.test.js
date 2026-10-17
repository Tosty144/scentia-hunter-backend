const mongoose = require('mongoose');
const Esencia = require('../src/models/Esencia');
const Movimiento = require('../src/models/Inventario');
const Venta = require('../src/models/Venta');

describe('modelo Esencia', () => {
  it('aplica los valores por defecto y valida bien', () => {
    const esencia = new Esencia({
      nombre: 'Khamra',
      variantes: [{ presentacion: '100ml', costo: 30, precio: 60 }],
    });
    expect(esencia.probador).toBe(false);
    expect(esencia.variantes[0].tipo).toBe('Genérico');
    expect(esencia.variantes[0].stock).toBe(0);
    expect(esencia.validateSync()).toBeUndefined();
  });

  it('exige el nombre', () => {
    const error = new Esencia({}).validateSync();
    expect(error.errors.nombre).toBeDefined();
  });

  it('exige presentación y rechaza costo negativo en una variante', () => {
    const error = new Esencia({
      nombre: 'Dior Sauvage',
      variantes: [{ costo: -1, precio: 10 }],
    }).validateSync();
    expect(error.errors['variantes.0.presentacion']).toBeDefined();
    expect(error.errors['variantes.0.costo']).toBeDefined();
  });
});

describe('modelo Movimiento (inventario)', () => {
  const datosValidos = () => ({
    tipo: 'ENTRADA',
    esenciaId: new mongoose.Types.ObjectId(),
    varianteId: 'v1',
    cantidad: 5,
  });

  it('es válido con los datos completos y asigna la fecha', () => {
    const mov = new Movimiento(datosValidos());
    expect(mov.validateSync()).toBeUndefined();
    expect(mov.fecha).toBeInstanceOf(Date);
  });

  it('rechaza un tipo distinto de ENTRADA o SALIDA', () => {
    const error = new Movimiento({ ...datosValidos(), tipo: 'OTRO' }).validateSync();
    expect(error.errors.tipo).toBeDefined();
  });

  it('exige la cantidad', () => {
    const datos = datosValidos();
    delete datos.cantidad;
    expect(new Movimiento(datos).validateSync().errors.cantidad).toBeDefined();
  });
});

describe('modelo Venta', () => {
  it('es válida con items y total, y asigna la fecha', () => {
    const venta = new Venta({
      total: 300,
      items: [{ esenciaId: new mongoose.Types.ObjectId(), varianteId: 'v1', cantidad: 2, precioUnitario: 150 }],
    });
    expect(venta.validateSync()).toBeUndefined();
    expect(venta.fecha).toBeInstanceOf(Date);
  });

  it('exige el total y los campos de cada item', () => {
    const error = new Venta({ items: [{ cantidad: 1 }] }).validateSync();
    expect(error.errors.total).toBeDefined();
    expect(error.errors['items.0.precioUnitario']).toBeDefined();
    expect(error.errors['items.0.varianteId']).toBeDefined();
  });
});
