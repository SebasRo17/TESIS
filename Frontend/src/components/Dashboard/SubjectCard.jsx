import React, { useMemo } from "react";
import { ArrowRight, BookOpenCheck, Calculator, CheckCircle2 } from "lucide-react";

export default function SubjectCard({ subject, onSelect }) {
  const palette = useMemo(() => {
    // Ajusta esta lógica según cómo venga tu subject
    // Ej: subject.key / subject.slug / subject.title
    const t = String(subject?.title || "").toLowerCase();

    // Verbal (teal/cyan)
    if (t.includes("verbal") || t.includes("lectora")) {
      return {
        iconBg: "bg-teal-50 border-teal-100",
        iconColor: "text-teal-700",
        bar: "from-teal-500 to-cyan-500",
        pill: "bg-teal-50 text-teal-700 border-teal-100",
        watermark: BookOpenCheck,
      };
    }

    // Matemático (indigo/blue)
    return {
      iconBg: "bg-indigo-50 border-indigo-100",
      iconColor: "text-indigo-700",
      bar: "from-indigo-500 to-sky-500",
      pill: "bg-indigo-50 text-indigo-700 border-indigo-100",
      watermark: Calculator,
    };
  }, [subject]);

  const WatermarkIcon = palette.watermark;

  const progress = Number(subject?.progress ?? 0); // 0..100
  const completed = subject?.completedTopics ?? subject?.completed ?? 0;
  const total = subject?.totalTopics ?? subject?.total ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(subject)}
      className="text-left relative w-full overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg p-7"
    >

      {/* header */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${palette.iconBg}`}>
            <WatermarkIcon className={`w-6 h-6 ${palette.iconColor}`} />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {subject.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {subject.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
          Ver <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* progress */}
      <div className="relative mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Progreso</p>
          <p className="text-sm font-extrabold text-slate-900">{progress}%</p>
        </div>

        <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${palette.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold text-slate-700">
              {completed}/{total}
            </span>
            temas completados
          </span>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${palette.pill}`}>
            {progress >= 80 ? "¡Vas excelente!" : progress >= 40 ? "Buen ritmo" : "Empecemos"}
          </span>
        </div>
      </div>
    </button>
  );
}
