// src/components/Auth/RegisterForm.jsx
import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  BookOpenCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import validarCedulaEcuatoriana from "../../utils/ValidarCedula";

export default function RegisterForm({ onToggleMode }) {
  const [fullName, setFullName] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const [error, setError] = useState("");
  const [cedulaError, setCedulaError] = useState("");

  const { register, isLoading } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCedulaError("");

    if (
      !fullName ||
      !cedula ||
      !email ||
      !birthdate ||
      !city ||
      !phone ||
      !password ||
      !confirm
    ) {
      setError("Completa todos los campos");
      return;
    }

    if (!validarCedulaEcuatoriana(cedula)) {
      setCedulaError("Cédula ecuatoriana no válida");
      setError("Revisa los campos marcados en rojo.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    // 📌 Por ahora seguimos usando el mismo registro básico
    const ok = await register(fullName, email, password);
    if (!ok) setError("No fue posible crear tu cuenta");
  };

  return (
    <div className="w-full max-w-5xl mx-auto shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row backdrop-blur-sm border border-slate-900/40 bg-white/5 md:h-[640px]">
      {/* PANEL IZQUIERDO */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 text-white p-8 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-xl p-2">
            <BookOpenCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-100">
              Únete a la plataforma
            </p>
            <h1 className="text-2xl font-semibold leading-tight">
              Crea tu cuenta y construye tu plan de estudio.
            </h1>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-sm text-indigo-50">
          <p>• Guarda tu progreso en simulacros.</p>
          <p>• Accede a materiales recomendados según tus resultados.</p>
          <p>• Organiza tu avance por temas y semanas.</p>
        </div>

        <p className="mt-6 text-xs text-indigo-100">
          Tip: elige una contraseña segura que recuerdes con facilidad.
        </p>
      </div>

      {/* PANEL DERECHO – REGISTRO (BLANCO) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-10 flex flex-col overflow-y-auto">
        {/* Switch Login / Registro */}
        <div className="flex mb-6 text-xs font-medium bg-slate-100 rounded-full p-1 shrink-0">
          <button
            type="button"
            onClick={onToggleMode}
            className="flex-1 rounded-full py-2 text-slate-500 hover:text-slate-900 transition"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-white shadow-sm py-2 text-slate-900 "
          >
            Crear cuenta
          </button>
        </div>

        <div className="text-left mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 align-middle flex items-center gap-2 justify-center">
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm text-slate-600 align-middle flex items-center gap-2 justify-center">
            Empieza a practicar hoy mismo. Solo te tomará unos segundos.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 flex-1 pb-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100 mb-2">
              {error}
            </div>
          )}

          {/* Nombre completo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Nombre completo
            </label>
            <div className="relative">
              <User className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tus nombres y apellidos"
              />
            </div>
          </div>

          {/* Cédula */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Cédula
            </label>
            <div className="relative">
              <input
                maxLength={10}
                inputMode="numeric"
                className={`w-full pr-3 py-2.5 rounded-xl border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  cedulaError
                    ? "border-red-400 focus:ring-red-500 focus:border-red-500 pl-3"
                    : "border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 pl-3"
                }`}
                value={cedula}
                onChange={(e) =>
                  setCedula(e.target.value.replace(/\D/g, ""))
                }
                placeholder="10 dígitos de tu cédula"
              />
            </div>
            {cedulaError && (
              <p className="text-xs text-red-600">{cedulaError}</p>
            )}
          </div>

          {/* Correo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Correo
            </label>
            <div className="relative">
              <Mail className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Ciudad
            </label>
            <input
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Quito, Guayaquil, etc."
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Teléfono
            </label>
            <input
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^\d+]/g, ""))
              }
              placeholder="+593 99 999 9999"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={show ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Confirmar contraseña
            </label>
            <input
              type={show ? "text" : "password"}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={isLoading}
            className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-2 text-xs text-center text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={onToggleMode}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
