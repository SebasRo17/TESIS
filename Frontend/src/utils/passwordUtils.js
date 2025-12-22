// src/utils/passwordUtils.js
export function validateStrongPassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_\-+={[}\]|;:'",.<>/?]/.test(password);

  if (password.length < minLength) {
    return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (!hasUpper) {
    return { ok: false, message: "Incluye al menos una letra mayúscula." };
  }
  if (!hasLower) {
    return { ok: false, message: "Incluye al menos una letra minúscula." };
  }
  if (!hasNumber) {
    return { ok: false, message: "Incluye al menos un número." };
  }
  if (!hasSymbol) {
    return { ok: false, message: "Incluye al menos un símbolo (!, @, #, $, etc.)." };
  }

  return { ok: true, message: "" };
}

// Opcional: para mostrar barra de fuerza
export function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_\-+={[}\]|;:'",.<>/?]/.test(password)) score++;

  if (!password) return { label: "", color: "bg-transparent", width: "w-0" };
  if (score <= 2) return { label: "Débil", color: "bg-red-400", width: "w-1/3" };
  if (score === 3) return { label: "Aceptable", color: "bg-amber-400", width: "w-2/3" };
  return { label: "Fuerte", color: "bg-emerald-500", width: "w-full" };
}
