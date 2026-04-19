// src/components/Auth/LoginForm.jsx
import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpenCheck,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import ForgotPasswordModal from "./ForgotPassword";

export default function LoginForm({ onToggleMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const { login, isLoading } = useAuth();
  const [showForgot, setShowForgot] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await login(email, password);
    if (!res?.ok) {
      setError(res?.error || "Credenciales incorrectas");
    }
  };

  return (
    <>
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
          {/* Left panel */}
          <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
            {/* Gradient background */}
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

            {/* Content */}
            <div className="relative z-10 p-10 flex flex-col justify-between h-full text-white">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 shadow-inner">
                    <BookOpenCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium">
                      Aula Virtual EPN
                    </p>
                    <h1 className="text-xl font-bold leading-tight">
                      Tu camino al éxito
                    </h1>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-3xl font-bold leading-tight">
                    Prepárate para el examen de admisión
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Simulacros, planes de estudio y seguimiento de tu progreso
                    en un solo lugar.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="bg-white/20 rounded-xl p-2">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">
                    Simuladores de examen por área
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="bg-white/20 rounded-xl p-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">
                    Retroalimentación automática
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="bg-white/20 rounded-xl p-2">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">
                    Recomendaciones personalizadas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/70">
                <Sparkles className="w-4 h-4" />
                <span>
                  Tip:{" "}
                  <span className="text-white font-medium">
                    estudia en bloques cortos y constantes
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col overflow-y-auto">
            {/* Toggle tabs */}
            <div className="flex mb-8 text-sm font-semibold bg-slate-100 rounded-2xl p-1.5">
              <button
                type="button"
                className="flex-1 rounded-xl bg-white shadow-sm py-3 text-slate-900 transition-all duration-300"
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={onToggleMode}
                className="flex-1 rounded-xl py-3 text-slate-400 hover:text-slate-600 transition-all duration-300"
              >
                Crear cuenta
              </button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                ¡Bienvenido de nuevo!
              </h2>
              <p className="text-slate-500">
                Ingresa con tu cuenta para continuar con tu plan de estudio.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-5 flex-1 flex flex-col justify-center"
            >
              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Correo electrónico
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

              {/* Password */}
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
                    autoComplete="current-password"
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

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-teal-600 cursor-pointer hover:text-teal-700 font-semibold transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                disabled={isLoading}
                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-slate-500">
              ¿Aún no tienes cuenta?{" "}
              <button
                onClick={onToggleMode}
                className="text-teal-600 cursor-pointer hover:text-teal-700 font-bold transition-colors"
              >
                Regístrate gratis
              </button>
            </p>
          </div>
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

