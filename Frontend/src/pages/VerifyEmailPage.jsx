// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmailRequest } from "../services/authService";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";

const FORMAL_SUCCESS = "Email verificado correctamente. Ya puedes iniciar sesión.";

// ✅ helper: normaliza mensajes del backend a uno más formal
function normalizeSuccessMessage(apiMessage) {
  const raw = String(apiMessage ?? "").trim();
  const lower = raw.toLowerCase();

  // ✅ cubre: "Email ya verificado", "ya verificado", "verificado previamente", "already verified"
  const alreadyVerified =
    /email\s+ya\s+verificado/.test(lower) ||
    /ya\s+est(a|á)\s+verificado/.test(lower) ||
    /verificado\s+previamente/.test(lower) ||
    /already\s+verified/.test(lower);

  if (alreadyVerified) return FORMAL_SUCCESS;

  // Si quieres FORZAR siempre el mensaje formal en éxito, descomenta:
  // return FORMAL_SUCCESS;

  // Caso por defecto: usa el mensaje del backend si existe; si no, formal
  return raw || FORMAL_SUCCESS;
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const uid = params.get("uid") || params.get("userId");
  const token = params.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  // ✅ evita doble ejecución por StrictMode (1 vez por key)
  const lastKeyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!uid || !token) {
        setStatus("error");
        setMessage("Enlace inválido o incompleto.");
        return;
      }

      const key = `verify-email:${uid}:${token}`;

      // ✅ si ya corrimos este mismo token en esta sesión, no dispares otra vez
      const cached = sessionStorage.getItem(key);
      if (cached === "success") {
        setStatus("success");
        setMessage(FORMAL_SUCCESS);
        return;
      }

      // ✅ guard anti doble-run por StrictMode
      if (lastKeyRef.current === key) return;
      lastKeyRef.current = key;

      try {
        const data = await verifyEmailRequest({ userId: uid, token });
        if (cancelled) return;

        sessionStorage.setItem(key, "success");
        setStatus("success");
        setMessage(normalizeSuccessMessage(data?.message));
      } catch (e) {
        if (cancelled) return;

        const raw =
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          "No fue posible verificar el email.";

        const msg = String(raw).trim();
        const lower = msg.toLowerCase();

        // ✅ si backend responde "ya verificado" como error, igual lo tratamos como éxito
        const alreadyVerified =
          /email\s+ya\s+verificado/.test(lower) ||
          /ya\s+est(a|á)\s+verificado/.test(lower) ||
          /verificado\s+previamente/.test(lower) ||
          /already\s+verified/.test(lower);

        if (alreadyVerified) {
          sessionStorage.setItem(key, "success");
          setStatus("success");
          setMessage(FORMAL_SUCCESS);
          return;
        }

        setStatus("error");
        setMessage(msg);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [uid, token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-50 px-4 overflow-hidden">
      {/* Fondo premium (igual al register) */}
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

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 text-center">
        {/* Icon bubble */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
          {status === "loading" && (
            <Loader2 className="h-7 w-7 text-teal-600 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          )}
          {status === "error" && (
            <XCircle className="h-7 w-7 text-rose-600" />
          )}
        </div>

        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Verificando tu email…
            </h1>
            <p className="text-sm text-slate-600">
              Esto puede tardar unos segundos.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <MailCheck className="h-4 w-4" />
              <span>Validando token y activando tu cuenta</span>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Verificación completada
            </h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition"
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              No se pudo verificar
            </h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition"
            >
              Volver al login
            </Link>

            <p className="mt-4 text-[11px] text-slate-500">
              Si el enlace expiró, solicita uno nuevo desde “¿Olvidaste tu contraseña?” o vuelve a registrarte.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
