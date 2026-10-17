// Crea un "modelo de Mongoose" falso para las pruebas unitarias (sin base de datos).
module.exports = function crearModeloMock() {
  const Modelo = jest.fn();
  Modelo.find = jest.fn();
  Modelo.findById = jest.fn();
  Modelo.findByIdAndUpdate = jest.fn();
  Modelo.findByIdAndDelete = jest.fn();
  Modelo.updateOne = jest.fn();
  return Modelo;
};
