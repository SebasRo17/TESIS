// src/components/Auth/ForgotPasswordModal.jsx
import React, { useState } from "react";
import { Mail, X, CheckCircle2 } from "lucide-react";
import { forgotPasswordRequest } from "../../services/authService";

export default function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!open) return null;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setIsSending(true);
    try {
      await forgotPasswordRequest(email);
      setStep("sent");
    } catch (e2) {
      const msg = e2?.response?.data?.error || "No fue posible enviar el correo.";
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const closeAll = () => {
    setStep("email");
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={closeAll}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "email" && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-3 align-middle flex items-center gap-2 justify-center">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-sm text-slate-600 mb-4 align-middle flex items-center gap-2 justify-center">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>

            {error && (
              <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Correo electrónico
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

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-xl cursor-pointer bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>
          </>
        )}

        {step === "sent" && (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">¡Correo enviado!</h2>
            <p className="text-sm text-slate-600 mb-2">
              Si existe el correo, se ha enviado un enlace de recuperación a:
            </p>
            <p className="text-sm font-semibold text-slate-800 mb-4">{email}</p>
            <p className="text-[11px] text-slate-500 mb-4 max-w-xs">
              Si no lo encuentras en tu bandeja de entrada, revisa también la carpeta de spam.
            </p>
            <button
              onClick={closeAll}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
