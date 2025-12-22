// src/utils/validarCedulaEcuatoriana.js
function validarCedulaEcuatoriana(cedula) {
  // Solo números
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 0 || (provincia > 24 && provincia !== 30)) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula[9], 10);
  const decenaSuperior = Math.ceil(suma / 10) * 10;

  return digitoVerificador === (decenaSuperior - suma);
}

export default validarCedulaEcuatoriana;
