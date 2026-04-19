import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName =
    user?.profile?.firstName || user?.profile?.lastName
      ? `${user?.profile?.firstName ?? ""} ${user?.profile?.lastName ?? ""}`.trim()
      : user?.email ?? "Usuario";

  const avatarLetter = (displayName?.[0] || "U").toUpperCase();

  // cerrar dropdown al hacer click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goProfile = () => {
    setOpen(false);
    navigate("/app/profile");
  };

  const onLogout = () => {
    setOpen(false);
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 font-extrabold">
            E
          </div>

          <Link to="/app/dashboard" className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-slate-900">EduPrep</span>
            <span className="text-xs font-semibold text-slate-500">
              Panel de estudiante
            </span>
          </Link>
        </div>

        {/* Right: user menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 font-extrabold">
              {avatarLetter}
            </div>

            <span className="hidden sm:block max-w-[220px] truncate">
              {displayName}
            </span>

            <span className="text-slate-400">▾</span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={goProfile}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Mi perfil
              </button>

              <div className="h-px bg-slate-100" />

              <button
                type="button"
                onClick={onLogout}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
