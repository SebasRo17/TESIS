// src/components/Auth/LoginForm.jsx
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, BookOpenCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ForgotPasswordModal from "./ForgotPassword"; 

export default function LoginForm({ onToggleMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  // solo necesitamos saber si el modal está abierto o no
  const [showForgot, setShowForgot] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, password);
    if (!ok) setError("Credenciales incorrectas");
  };

  return (
    <>
      {/* CARD PRINCIPAL LOGIN */}
      <div className="w-full max-w-5xl mx-auto shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row backdrop-blur-sm border border-slate-900/40 bg-white/5 md:h-[640px]">
        {/* PANEL IZQUIERDO */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-8 flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2">
              <BookOpenCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-100">
                Aula virtual EPN
              </p>
              <h1 className="text-2xl font-semibold leading-tight">
                Prepárate para el examen de admisión
              </h1>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="w-4 h-4" />
              </span>
              <p className="text-sm text-blue-100">
                Simulacros, planes de estudio y seguimiento de tu progreso en un
                solo lugar.
              </p>
            </div>
            <ul className="text-sm space-y-1 text-blue-100">
              <li>• Simuladores de examen por área</li>
              <li>• Retroalimentación automática</li>
              <li>• Recomendaciones de estudio personalizadas</li>
            </ul>
          </div>

          <p className="mt-6 text-xs text-blue-100">
            Consejo del día:{" "}
            <span className="font-semibold">
              estudia en bloques cortos y constantes.
            </span>
          </p>
        </div>

        {/* PANEL DERECHO – LOGIN (BLANCO) */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-10 flex flex-col">
          {/* Switch Login / Registro */}
          <div className="flex mb-6 text-xs font-medium bg-slate-100 rounded-full p-1">
            <button
              type="button"
              className="flex-1 rounded-full bg-white shadow-sm py-2 text-slate-900"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onToggleMode}
              className="flex-1 rounded-full py-2 text-slate-500 hover:text-slate-900 transition"
            >
              Crear cuenta
            </button>
          </div>

          <div className="text-left mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center">
              ¡Bienvenido de nuevo!
            </h2>
            <p className="mt-2 text-sm text-slate-600 text-center">
              Ingresa con tu cuenta para continuar con tu plan de estudio.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-5 flex-1 flex flex-col justify-center"
          >
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100 mb-2">
                {error}
              </div>
            )}

            {/* Correo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Olvidaste tu contraseña */}
            <div className="flex justify-end text-xs mt-1">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              disabled={isLoading}
              className="w-full mt-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold shadow-sm hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-500">
            ¿Aún no tienes cuenta?{" "}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </div>

      {/* MODAL OLVIDASTE CONTRASEÑA */}
      <ForgotPasswordModal
        open={showForgot}
        onClose={() => setShowForgot(false)}
      />
    </>
  );
}
