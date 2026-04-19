import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";

export default function SubjectCard({ subject, isSelected, onClick }) {

  return (
    <button
      onClick={onClick}
      className={[
        "group w-full rounded-3xl p-5 text-left transition-all duration-300",
        "bg-gradient-to-br from-white via-white/80 to-cyan-50/40",
        "border backdrop-blur",
        "hover:-translate-y-0.5 hover:shadow-xl",
        isSelected
          ? "border-cyan-300 ring-4 ring-cyan-100 shadow-lg"
          : "border-slate-200 hover:border-cyan-200",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div
            className={[
              "grid h-12 w-12 place-items-center rounded-2xl",
              "bg-gradient-to-br from-cyan-500 to-indigo-500",
              "text-white shadow-md",
            ].join(" ")}
          >
            <BookOpen className="h-6 w-6" />
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                {subject.title}
              </h3>

              {subject.code && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  {subject.code}
                </span>
              )}

            </div>

            {subject.description && (
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        <ChevronRight className="mt-2 h-6 w-6 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-600" />
      </div>

      {/* Progreso */}
      <div className="mt-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${subject.progress || 0}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{subject.progress || 0}% completado</span>
          <span>
            {(subject.completedTopics ?? 0)}/{(subject.totalTopics ?? 0)} temas
          </span>
        </div>
      </div>
    </button>
  );
}
