import React, { useEffect, useMemo, useState } from "react";
import {
  updateMyProfileRequest,
  changeMyPasswordRequest,
} from "../../services/usersService";
import { useAuth } from "../../contexts/AuthContext";

import {
  validateStrongPassword,
  getPasswordStrength,
} from "../../utils/passwordUtils";

import {
  User,
  IdCard,
  Phone,
  MapPin,
  CalendarDays,
  Target,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    document: "",
    goal: "",
    phone: "",
    birthDate: "",
    city: "",
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);
  const [pwdErr, setPwdErr] = useState(null);

  const email = user?.email ?? "";
  const serverProfile = user?.profile ?? {};

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      firstName: serverProfile.firstName ?? "",
      lastName: serverProfile.lastName ?? "",
      document: serverProfile.document ?? "",
      goal: serverProfile.goal ?? "",
      phone: serverProfile.phone ?? "",
      birthDate: serverProfile.birthDate ?? "",
      city: serverProfile.city ?? "",
    });
  }, [user]); // eslint-disable-line

  const fullName = useMemo(() => {
    const f = profileForm.firstName?.trim() || "";
    const l = profileForm.lastName?.trim() || "";
    return `${f} ${l}`.trim();
  }, [profileForm.firstName, profileForm.lastName]);

  const onChangeProfile = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangePwd = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
    // Limpia mensajes mientras el usuario escribe
    setPwdErr(null);
    setPwdMsg(null);
  };

  // ✅ Reglas en vivo (para mostrar checks)
  const passwordRules = useMemo(() => {
    const p = pwdForm.newPassword || "";
    const hasMinLength = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSymbol = /[!@#$%^&*()_\-+={[}\]|;:'",.<>/?]/.test(p);

    return [
      { ok: hasMinLength, text: "Mínimo 8 caracteres" },
      { ok: hasUpper, text: "Al menos 1 mayúscula (A-Z)" },
      { ok: hasLower, text: "Al menos 1 minúscula (a-z)" },
      { ok: hasNumber, text: "Al menos 1 número (0-9)" },
      { ok: hasSymbol, text: "Al menos 1 símbolo (!, @, #, $, etc.)" },
    ];
  }, [pwdForm.newPassword]);

  const strength = useMemo(
    () => getPasswordStrength(pwdForm.newPassword || ""),
    [pwdForm.newPassword]
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);

    try {
      setSavingProfile(true);

      const updated = await updateMyProfileRequest(profileForm);

      const nextUser = {
        ...user,
        ...updated,
        profile: updated?.profile
          ? updated.profile
          : { ...(user?.profile ?? {}), ...profileForm },
      };

      setUser(nextUser);

      try {
        localStorage.setItem("user", JSON.stringify(nextUser));
      } catch (_) {}

      setProfileMsg("Perfil actualizado correctamente.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo actualizar el perfil.";
      setProfileErr(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdErr(null);

    const { currentPassword, newPassword, confirmPassword } = pwdForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdErr("Completa todos los campos para cambiar la contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErr("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    // Validación fuerte con passwordUtils
    const strongCheck = validateStrongPassword(newPassword);
    if (!strongCheck.ok) {
      setPwdErr(strongCheck.message);
      return;
    }

    try {
      setSavingPwd(true);

      await changeMyPasswordRequest({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPwdMsg("Contraseña cambiada correctamente.");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo cambiar la contraseña.";
      setPwdErr(msg);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-cyan-50 via-white to-indigo-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-xs font-bold text-slate-700">Perfil</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 text-center">
            Mi perfil{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              EduPrep
            </span>
          </h1>

          <p className="text-sm text-slate-600 text-center">
            Administra tu información personal y tu contraseña.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Card Perfil */}
          <div className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Datos del usuario
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-semibold">Correo:</span>{" "}
                  <span className="text-slate-700">{email}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-50 to-indigo-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-cyan-200">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-cyan-700 ring-1 ring-cyan-200">
                  {(fullName?.[0] || "U").toUpperCase()}
                </span>
                {fullName || "Usuario"}
              </div>
            </div>

            {profileErr && (
              <div className={alertErrorClass}>
                <span className="text-lg">⚠️</span>
                <span>{profileErr}</span>
              </div>
            )}

            {profileMsg && (
              <div className={alertSuccessClass}>
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Nombres">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <User size={18} />
                    </span>
                    <input
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={onChangeProfile}
                      placeholder="Ingresa tus nombres"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Apellidos">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <User size={18} />
                    </span>
                    <input
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={onChangeProfile}
                      placeholder="Ingresa tus apellidos"
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Documento">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <IdCard size={18} />
                    </span>
                    <input
                      name="document"
                      value={profileForm.document}
                      onChange={onChangeProfile}
                      placeholder="Ingresa tu cédula"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Teléfono">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <Phone size={18} />
                    </span>
                    <input
                      name="phone"
                      value={profileForm.phone}
                      onChange={onChangeProfile}
                      placeholder="Ingresa tu número de teléfono"
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Ciudad">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <MapPin size={18} />
                    </span>
                    <input
                      name="city"
                      value={profileForm.city}
                      onChange={onChangeProfile}
                      placeholder="Ingresa tu ciudad"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Fecha de nacimiento">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <CalendarDays size={18} />
                    </span>
                    <input
                      type="date"
                      name="birthDate"
                      value={profileForm.birthDate}
                      onChange={onChangeProfile}
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Meta / Objetivo">
                <div className={inputWrapClass}>
                  <span className={inputIconClass}>
                    <Target size={18} />
                  </span>
                  <input
                    name="goal"
                    value={profileForm.goal}
                    onChange={onChangeProfile}
                    placeholder="Ej: Ingresar a la EPN"
                    className={inputClass}
                  />
                </div>
              </Field>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className={primaryBtnClass}
                >
                  {savingProfile ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Guardando...
                    </span>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>

                <p className="text-xs text-slate-500">
                  Los cambios se aplican a tu cuenta inmediatamente.
                </p>
              </div>
            </form>
          </div>

          {/* Card Password */}
          <div className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Cambiar contraseña
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  La contraseña debe cumplir las reglas de seguridad.
                </p>
              </div>
            </div>

            {pwdErr && (
              <div className={alertErrorClass}>
                <span className="text-lg">⚠️</span>
                <span>{pwdErr}</span>
              </div>
            )}

            {pwdMsg && (
              <div className={alertSuccessClass}>
                <span>{pwdMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <Field label="Contraseña actual">
                <div className={inputWrapClass}>
                  <span className={inputIconClass}>
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={pwdForm.currentPassword}
                    onChange={onChangePwd}
                    placeholder="********"
                    className={inputClass}
                  />
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Nueva contraseña">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <Sparkles size={18} />
                    </span>
                    <input
                      type="password"
                      name="newPassword"
                      value={pwdForm.newPassword}
                      onChange={onChangePwd}
                      placeholder="Ej: Abc123!@"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Confirmar nueva contraseña">
                  <div className={inputWrapClass}>
                    <span className={inputIconClass}>
                      <CheckCircle2 size={18} />
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={pwdForm.confirmPassword}
                      onChange={onChangePwd}
                      placeholder="Repite la nueva contraseña"
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>

              {/* Panel fuerza */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-800">
                    Fuerza
                  </p>
                  {/* Badge fuerza */}
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                      strength.label === "Fuerte"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : strength.label === "Media"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-rose-50 text-rose-700 ring-rose-200",
                    ].join(" ")}
                  >
                    {strength.label}
                  </span>
                </div>

                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={[
                      "h-2.5 transition-all",
                      strength.width,
                      strength.color,
                      "shadow-[0_0_18px_rgba(34,211,238,0.35)]",
                    ].join(" ")}
                  />
                </div>

                <ul className="mt-4 space-y-2">
                  {passwordRules.map((r) => (
                    <li
                      key={r.text}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={[
                          "grid h-6 w-6 place-items-center rounded-full border text-xs font-black",
                          r.ok
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-400",
                        ].join(" ")}
                      >
                        {r.ok ? "✓" : "•"}
                      </span>
                      <span
                        className={r.ok ? "text-slate-800" : "text-slate-500"}
                      >
                        {r.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={savingPwd}
                className={darkBtnClass}
              >
                {savingPwd ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Actualizando...
                  </span>
                ) : (
                  "Cambiar contraseña"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const cardClass =
  "rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.08)] backdrop-blur";

const alertErrorClass =
  "mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700";

const alertSuccessClass =
  "mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";

const inputWrapClass =
  "relative flex items-center rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-100";

const inputIconClass = "absolute left-3 text-slate-400";

const inputClass =
  "h-11 w-full rounded-2xl bg-transparent pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400";

const primaryBtnClass =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70";

const darkBtnClass =
  "inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(15,23,42,0.25)] transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70";
