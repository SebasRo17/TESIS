import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, GraduationCap, Loader2, Target } from "lucide-react";

import { getCourseProgress } from "../../services/progressService";

function formatDuration(seconds = 0) {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function StatCard({ label, value, hint, tone, icon: Icon }) {
  return (
    <div className={["rounded-3xl border bg-white p-5 shadow-sm", tone].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-600">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-700 shadow-sm">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function SubjectOverview({ subject, courseId, refreshToken = 0 }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(Boolean(courseId));

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!courseId) {
        setProgress(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCourseProgress(courseId);
        if (!alive) return;
        setProgress(data);
      } catch (error) {
        if (!alive) return;
        setProgress(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [courseId, refreshToken]);

  const completion = progress?.completionPercentage ?? 0;
  const totalLessons = progress?.totalLessons ?? 0;
  const completedLessons = progress?.completedLessons ?? 0;
  const inProgressLessons = progress?.inProgressLessons ?? 0;
  const totalTime = progress?.totalTimeSpentSec ?? 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-sky-500/15 px-6 py-6">
        <div className="absolute inset-0 pointer-events-none opacity-70 [background:radial-gradient(circle_at_15%_20%,rgba(20,184,166,0.20),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.20),transparent_34%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.16),transparent_40%)]" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700">
              <Target size={13} /> Resumen de progreso
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">Tu avance en {subject?.name || "el curso"}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              {subject?.description || "Seguimiento consolidado del curso, con progreso, lecciones y tiempo de estudio."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Progreso total</p>
            <div className="mt-1 text-3xl font-black text-slate-900">
              {loading ? <Loader2 className="inline-block animate-spin" size={28} /> : `${Math.round(completion)}%`}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Progreso total"
            value={loading ? "--" : `${Math.round(completion)}%`}
            hint="Porcentaje completado del curso"
            tone="border-teal-100 bg-teal-50/70"
            icon={Target}
          />
          <StatCard
            label="Lecciones completadas"
            value={loading ? "--" : `${completedLessons}`}
            hint={loading ? "Cargando datos" : `de ${totalLessons} lecciones`}
            tone="border-sky-100 bg-sky-50/70"
            icon={CheckCircle2}
          />
          <StatCard
            label="En progreso"
            value={loading ? "--" : `${inProgressLessons}`}
            hint="Lecciones iniciadas y pendientes"
            tone="border-cyan-100 bg-cyan-50/70"
            icon={GraduationCap}
          />
          <StatCard
            label="Tiempo total"
            value={loading ? "--" : formatDuration(totalTime)}
            hint="Tiempo acumulado de estudio"
            tone="border-blue-100 bg-blue-50/70"
            icon={Clock3}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-slate-900">Estado actual</p>
              <p className="mt-1 text-sm text-slate-600">
                {loading
                  ? "Cargando progreso del curso..."
                  : progress
                    ? `Llevas ${Math.round(completion)}% del curso y ${completedLessons} lecciones completadas.`
                    : "Todavía no hay progreso registrado para este curso."}
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 transition-all"
              style={{ width: `${Math.max(4, Math.min(100, completion || 0))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
