// src/components/Auth/ResetPasswordView.jsx
import React, { useMemo, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  BadgeCheck,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  validateStrongPassword,
  getPasswordStrength,
} from "../../utils/passwordUtils";
import { resetPasswordRequest } from "../../services/authService";

/**  mismas reglas visuales que Register */
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

export default function ResetPasswordView({ uid, token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const strength = getPasswordStrength(password);

  const userId = useMemo(() => {
    const n = Number(uid);
    return Number.isFinite(n) ? n : null;
  }, [uid]);

  const rules = useMemo(() => getPasswordRules(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId || !token) {
      setError("Enlace inválido o incompleto.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const validation = validateStrongPassword(password);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setIsSaving(true);
    try {
      await resetPasswordRequest({
        userId,
        token,
        newPassword: password,
        confirmPassword: confirm,
      });
      setDone(true);
    } catch (e2) {
      const msg =
        e2?.response?.data?.error || "No fue posible actualizar la contraseña.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Fondo premium claro reutilizado (igual que register/verify)
  const Background = () => (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100" />
      <div className="absolute -top-24 left-[-120px] w-[520px] h-[520px] bg-teal-400/25 rounded-full blur-3xl" />
      <div className="absolute top-10 right-[-140px] w-[560px] h-[560px] bg-sky-400/22 rounded-full blur-3xl" />
      <div className="absolute bottom-[-160px] left-1/3 w-[680px] h-[680px] bg-cyan-300/18 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')",
        }}
      />
    </div>
  );

  if (done) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-50 px-4 overflow-hidden">
        <Background />
        <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Contraseña actualizada!
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>

          <a
            href="/login"
            className="inline-flex w-full items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-50 px-4 overflow-hidden">
      <Background />

      {/* Loader overlay cuando guarda */}
      {isSaving && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/35 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/90 border border-white/40 shadow-xl px-6 py-5 flex flex-col items-center text-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Guardando…</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Actualizando tu contraseña
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Crea una nueva contraseña
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Elige una contraseña segura para tu cuenta.
        </p>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nueva contraseña */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nueva contraseña
            </label>

            <div className="relative group">
              <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                type={showPass ? "text" : "password"}
                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Barra de fuerza (si ya la usas) */}
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

          {/* Confirmar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Confirmar contraseña
            </label>
            <div className="relative group">
              <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                type={showPass ? "text" : "password"}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

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

          {/* ✅ Contraseña segura con checks (full width) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Contraseña segura
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <RuleItem ok={rules.length} label="Mínimo 8 caracteres" />
              <RuleItem ok={rules.upper} label="Al menos 1 letra mayúscula" />
              <RuleItem ok={rules.lower} label="Al menos 1 letra minúscula" />
              <RuleItem ok={rules.number} label="Al menos 1 número" />
              <RuleItem ok={rules.symbol} label="Al menos 1 símbolo (!@#…)" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-base shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            Guardar nueva contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
