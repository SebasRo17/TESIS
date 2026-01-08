// src/components/Auth/RegisterForm.jsx
import React, { useMemo, useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  BookOpenCheck,
  CheckCircle2,
  Target,
  Zap,
  TrendingUp,
  Sparkles,
  BadgeCheck,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  IdCard,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import validarCedulaEcuatoriana from "../../utils/ValidarCedula";

function splitFullName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "-";
  return { firstName, lastName };
}

function getPasswordRules(pass) {
  const p = pass || "";
  return {
    length: p.length >= 8,
    upper: /[A-ZÁÉÍÓÚÑ]/.test(p),
    lower: /[a-záéíóúñ]/.test(p),
    number: /\d/.test(p),
    symbol: /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(p),
  };
}

function RuleItem({ ok, label }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <BadgeCheck className="w-4 h-4 text-emerald-600" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-300" />
      )}
      <span className={ok ? "text-slate-700" : "text-slate-500"}>{label}</span>
    </div>
  );
}

export default function RegisterForm({ onToggleMode }) {
  const [fullName, setFullName] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState(""); // ✅ NUEVO
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const [error, setError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [registered, setRegistered] = useState(false);

  const { register, isLoading } = useAuth();

  const rules = useMemo(() => getPasswordRules(password), [password]);
  const passwordStrong = useMemo(
    () =>
      rules.length &&
      rules.upper &&
      rules.lower &&
      rules.number &&
      rules.symbol,
    [rules]
  );

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

    if (!passwordStrong) {
      setError("Tu contraseña aún no cumple con los requisitos de seguridad.");
      return;
    }

    const { firstName, lastName } = splitFullName(fullName);

    const payload = {
      email,
      password,
      confirmPassword: confirm,
      firstName,
      lastName,
      document: cedula,
      phone,
      birthDate: birthdate,
      city,
      goal: goal?.trim() ? goal.trim() : null,
    };

    const res = await register(payload);
    if (!res?.ok) {
      setError(res?.error || "No fue posible crear tu cuenta");
      return;
    }

    setSuccessMessage(
      res?.message || "Revisa tu correo para verificar tu email."
    );
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen w-screen overflow-hidden flex items-center justify-center relative bg-slate-50">
      {/* Fondo premium (aurora + grid suave + noise) */}
      <div className="absolute inset-0">
        {/* base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100" />

        {/* auroras */}
        <div className="absolute -top-24 left-[-120px] w-[520px] h-[520px] bg-teal-400/25 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-140px] w-[560px] h-[560px] bg-sky-400/22 rounded-full blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 w-[680px] h-[680px] bg-cyan-300/18 rounded-full blur-3xl" />

        {/* noise sutil */}
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')",
          }}
        />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-5xl mx-auto shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row backdrop-blur-xl border border-white/10 bg-white/70 md:h-[680px]">
        {/* Left panel (mismos colores del login) */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/90 via-cyan-500/80 to-sky-600/90" />

          {/* Decorative shapes */}
          <div className="absolute top-10 right-10 w-32 h-32 border border-white/20 rounded-2xl rotate-12 animate-[float_6s_ease-in-out_infinite]" />
          <div
            className="absolute bottom-20 left-10 w-24 h-24 border border-white/15 rounded-full animate-[float_7s_ease-in-out_infinite]"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/3 left-1/4 w-16 h-16 bg-white/10 rounded-xl rotate-45 animate-[float_8s_ease-in-out_infinite]"
            style={{ animationDelay: "2s" }}
          />

          <div className="relative z-10 p-10 flex flex-col justify-between h-full text-white">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 shadow-inner">
                  <BookOpenCheck className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium">
                    Únete a la plataforma
                  </p>
                  <h1 className="text-xl font-bold leading-tight">
                    Aula Virtual EPN
                  </h1>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold leading-tight">
                  Crea tu cuenta y construye tu plan de estudio.
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Guarda tu progreso, accede a material recomendado y practica
                  con simuladores.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-white/20 rounded-xl p-2">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">
                  Guarda tu progreso en simulacros
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-white/20 rounded-xl p-2">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">
                  Accede a materiales recomendados
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-white/20 rounded-xl p-2">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">
                  Organiza tu avance por temas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="w-4 h-4" />
              <span>
                Tip:{" "}
                <span className="text-white font-medium">
                  elige una contraseña segura
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col overflow-y-auto">
          {/* Toggle tabs */}
          <div className="flex mb-8 text-sm font-semibold bg-slate-100 rounded-2xl p-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleMode}
              className="flex-1 rounded-xl py-3 text-slate-400 hover:text-slate-600 transition-all duration-300"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-white shadow-sm py-3 text-slate-900 transition-all duration-300"
            >
              Crear cuenta
            </button>
          </div>

          <div className="text-center mb-8 shrink-0">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Crear cuenta
            </h2>
            <p className="text-slate-500">Empieza a practicar hoy mismo.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* GRID 2 columnas (desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nombre completo
                </label>
                <div className="relative group">
                  <User className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tus nombres y apellidos"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Cédula */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cédula
                </label>
                <div className="relative group">
                  <IdCard className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    maxLength={10}
                    inputMode="numeric"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      cedulaError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/10"
                    }`}
                    value={cedula}
                    onChange={(e) =>
                      setCedula(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10 dígitos"
                  />
                </div>
                {cedulaError && (
                  <p className="text-xs text-red-600">{cedulaError}</p>
                )}
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Correo
                </label>
                <div className="relative group">
                  <Mail className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Fecha nacimiento */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fecha de nacimiento
                </label>
                <div className="relative group">
                  <Calendar className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                  />
                </div>
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ciudad
                </label>
                <div className="relative group">
                  <MapPin className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Quito, Guayaquil, etc."
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Teléfono
                </label>
                <div className="relative group">
                  <Phone className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^\d+]/g, ""))
                    }
                    placeholder="+593 99 999 9999"
                  />
                </div>
              </div>

              {/* Meta (goal) - full width en desktop */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Meta
                  </label>
                  <span className="text-xs text-slate-400">
                    {goal.length}/50
                  </span>
                </div>
                <div className="relative group">
                  <Target className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    maxLength={50}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Ej: Prepararme para EPN"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type={show ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={
                      show ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {show ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Confirmar contraseña
                </label>
                <div className="relative group">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type={show ? "text" : "password"}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                {/* match hint */}
                {confirm && (
                  <p
                    className={`text-xs ${
                      confirm === password ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {confirm === password
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"}
                  </p>
                )}
              </div>

              {/* Contraseña segura - FULL WIDTH */}
              <div className="md:col-span-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contraseña segura
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <RuleItem ok={rules.length} label="Mínimo 8 caracteres" />
                    <RuleItem
                      ok={rules.upper}
                      label="Al menos 1 letra mayúscula"
                    />
                    <RuleItem
                      ok={rules.lower}
                      label="Al menos 1 letra minúscula"
                    />
                    <RuleItem ok={rules.number} label="Al menos 1 número" />
                    <RuleItem
                      ok={rules.symbol}
                      label="Al menos 1 símbolo (!@#…)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              disabled={isLoading}
              className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
            >
              {isLoading ? "Creando..." : "Crear cuenta"}
            </button>

            <p className="mt-4 text-sm text-center text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={onToggleMode}
                className="text-teal-600 hover:text-teal-700 font-bold transition-colors"
                type="button"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* LOADER OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/55 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl border border-slate-200">
            <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">
              Creando tu cuenta...
            </p>
            <p className="text-xs text-slate-500">
              Enviando correo de verificación
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              ¡Cuenta creada!
            </h2>
            <p className="text-sm text-slate-600 mb-6">{successMessage}</p>

            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                onToggleMode(); // vuelve al login
              }}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition"
            >
              Ir al inicio de sesión
            </button>

            <p className="mt-5 text-[11px] text-slate-500">
              Importante: no podrás iniciar sesión hasta verificar tu correo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
