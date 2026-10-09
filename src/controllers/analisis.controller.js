const Esencia = require('../models/Esencia');
const Venta = require('../models/Venta');

const UMBRAL_BAJO_STOCK = 5;

// Carga esencias y ventas una sola vez y arma los mapas que usan todos los endpoints.
async function cargarContexto() {
  const [esencias, ventas] = await Promise.all([
    Esencia.find().lean(),
    Venta.find().lean(),
  ]);

  // Mapa "esenciaId:varianteId" -> datos de la variante
  const variantes = new Map();
  for (const e of esencias) {
    for (const v of e.variantes || []) {
      variantes.set(`${e._id}:${v._id}`, {
        esencia: e.nombre,
        presentacion: v.presentacion,
        tipo: v.tipo,
        stock: v.stock || 0,
        costo: v.costo || 0,
      });
    }
  }

  // Mapa "esenciaId:varianteId" -> acumulado de ventas
  const vendidos = new Map();
  for (const venta of ventas) {
    for (const item of venta.items || []) {
      const key = `${item.esenciaId}:${item.varianteId}`;
      const info = variantes.get(key);
      const acc = vendidos.get(key) || { cantidad: 0, ingreso: 0, costo: 0, ultimaVenta: null };
      acc.cantidad += item.cantidad;
      acc.ingreso += item.precioUnitario * item.cantidad;
      acc.costo += (info ? info.costo : 0) * item.cantidad;
      if (!acc.ultimaVenta || venta.fecha > acc.ultimaVenta) acc.ultimaVenta = venta.fecha;
      vendidos.set(key, acc);
    }
  }

  return { esencias, ventas, variantes, vendidos };
}

// Filas de productos vendidos, ordenadas de mayor a menor cantidad.
function filasVendidas(variantes, vendidos) {
  return [...vendidos.entries()]
    .map(([key, v]) => {
      const info = variantes.get(key);
      return {
        producto: info ? info.esencia : 'Producto eliminado',
        variante: info ? info.presentacion : '-',
        cantidad: v.cantidad,
        ingreso: v.ingreso,
        costo: v.costo,
        ganancia: v.ingreso - v.costo,
      };
    })
    .sort((a, b) => b.cantidad - a.cantidad);
}

exports.obtenerDashboard = async (req, res) => {
  try {
    const { esencias, ventas, variantes, vendidos } = await cargarContexto();
    const lista = [...variantes.values()];
    const enVenta = lista;

    const inventarioDisponible = enVenta.reduce((s, v) => s + v.stock, 0);

    const costoVendido = [...vendidos.values()].reduce((s, v) => s + v.costo, 0);
    // Inversión = costo de lo que hay en stock + costo de lo que ya se vendió
    const inversionTotal = lista.reduce((s, v) => s + v.costo * v.stock, 0) + costoVendido;

    const ingresoTotal = ventas.reduce((s, v) => s + (v.total || 0), 0);
    const gananciaTotal = ingresoTotal - costoVendido;

    const masVendidos = filasVendidas(variantes, vendidos)
      .slice(0, 5)
      .map(({ producto, variante, cantidad, ganancia }) => ({ producto, variante, cantidad, ganancia }));

    const umbral = Number(req.query.umbral) || UMBRAL_BAJO_STOCK;
    const bajoStock = enVenta
      .filter((v) => v.stock <= umbral)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10)
      .map(({ esencia, tipo, presentacion, stock }) => ({ esencia, tipo, presentacion, stock }));

    res.json({
      status: 'OK',
      totalEsencias: esencias.length,
      totalVentas: ventas.length,
      inventarioDisponible,
      inversionTotal,
      ingresoTotal,
      gananciaTotal,
      masVendidos,
      bajoStock,
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

exports.obtenerRanking = async (req, res) => {
  try {
    const { variantes, vendidos } = await cargarContexto();
    res.json(filasVendidas(variantes, vendidos).slice(0, 10));
  } catch (error) {
    console.error('Error en ranking:', error);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
};

exports.obtenerSinMovimiento = async (req, res) => {
  try {
    const { variantes, vendidos } = await cargarContexto();
    const dias = Number(req.query.dias) || 30;
    const limite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

    const filas = [...variantes.entries()]
      .filter(([key, v]) => {
        if (v.stock <= 0) return false;
        const venta = vendidos.get(key);
        return !venta || venta.ultimaVenta < limite;
      })
      .map(([, v]) => ({ esencia: v.esencia, tipo: v.tipo, presentacion: v.presentacion, stock: v.stock }));

    res.json(filas);
  } catch (error) {
    console.error('Error en sin movimiento:', error);
    res.status(500).json({ error: 'Error al consultar productos sin movimiento' });
  }
};

exports.obtenerRentabilidad = async (req, res) => {
  try {
    const { variantes, vendidos } = await cargarContexto();
    const filas = filasVendidas(variantes, vendidos)
      .map((f) => ({
        ...f,
        margen: f.ingreso ? Math.round((f.ganancia / f.ingreso) * 100) : 0,
      }))
      .sort((a, b) => b.ganancia - a.ganancia);

    res.json(filas);
  } catch (error) {
    console.error('Error en rentabilidad:', error);
    res.status(500).json({ error: 'Error al calcular rentabilidad' });
  }
};