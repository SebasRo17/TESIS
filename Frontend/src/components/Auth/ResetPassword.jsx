// src/components/Auth/ResetPasswordView.jsx
import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { validateStrongPassword, getPasswordStrength } from "../../utils/passwordUtils";

export default function ResetPasswordView({ token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const validation = validateStrongPassword(password);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    // Aquí iría tu llamada real a la API: resetPassword(token, password)
    console.log("Simulando cambio de contraseña con token:", token);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.3),transparent_55%)]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Contraseña actualizada!
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.3),transparent_55%)] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Crea una nueva contraseña
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Elige una contraseña segura para tu cuenta.
        </p>

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password && (
              <div className="mt-1 flex items-center gap-2">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} ${strength.width} transition-all`}
                  />
                </div>
                <span className="text-[11px] text-slate-500">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Confirmar contraseña
            </label>
            <input
              type={showPass ? "text" : "password"}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Guardar nueva contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
