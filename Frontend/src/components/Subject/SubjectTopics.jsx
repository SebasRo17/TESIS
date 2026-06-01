import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  PlayCircle,
  Layers,
  LineChart,
} from "lucide-react";

import { getCourseTopicsTree, getTopicById } from "../../services/topicsService";
import {
  getTopicMasteryJournal,
} from "../../services/masteryService";
import { getCourseTopicsProgress } from "../../services/progressService";

/**
 * Helpers
 */
function flattenTree(nodes) {
  const out = [];
  const walk = (arr, depth = 0) => {
    for (const n of arr) {
      out.push({ ...n, _depth: depth, _childrenCount: n.children?.length || 0 });
      if (n.children?.length) walk(n.children, depth + 1);
    }
  };
  walk(nodes ?? [], 0);
  return out;
}

function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clampPercent(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getLessonStatusLabel(value) {
  const key = String(value || "").toLowerCase();
  if (key === "completed") return "Completada";
  if (key === "in_progress") return "En progreso";
  if (key === "not_started") return "Sin iniciar";
  return value ? String(value) : "Sin estado";
}

function formatLessonDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TopicCard({ node, isSelected, onSelect, lessonCount, loadingMastery }) {
  const progress = loadingMastery ? null : clamp01(node.progress ?? 0);
  const progressPercent = progress == null ? null : Math.round(progress * 100);
  const done = progress >= 1;
  const depth = node._depth || 0;
  const depthPadding = Math.min(depth * 18, 54);
  const connectorOffset = Math.max(depthPadding - 10, 0);

  return (
    <button
      onClick={() => onSelect(node.id)}
      className={[
        "w-full text-left rounded-2xl border p-4 transition group relative overflow-visible",
        isSelected
          ? "border-cyan-200 bg-cyan-50/60 shadow-sm"
          : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
      style={{ marginLeft: `${depthPadding}px`, width: `calc(100% - ${depthPadding}px)` }}
    >
      {depth > 0 ? (
        <div
          className="pointer-events-none absolute top-0 h-full w-px bg-cyan-200/80"
          style={{ left: `-${connectorOffset}px` }}
        />
      ) : null}

      {depth > 0 ? (
        <div
          className="pointer-events-none absolute top-7 h-px bg-cyan-200/80"
          style={{ left: `-${connectorOffset}px`, width: `${Math.max(connectorOffset, 8)}px` }}
        />
      ) : null}

      {/* glow suave */}
      {isSelected ? (
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
      ) : null}

      <div className="relative flex items-start gap-3">
        <div
          className={[
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
            done ? "bg-cyan-600 text-white" : loadingMastery ? "bg-cyan-500/10 text-cyan-500" : "bg-cyan-500/15 text-cyan-700",
          ].join(" ")}
        >
            {done ? <CheckCircle2 size={20} /> : <Circle size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 truncate">{node.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  Nivel {depth + 1}
                </span>
                {node._childrenCount > 0 ? (
                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-bold text-cyan-700">
                    {node._childrenCount} subtemas
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-600 line-clamp-1">
                {node.description || " "}
              </p>
            </div>

            <ChevronRight className="text-slate-400 group-hover:text-slate-700" size={18} />
          </div>

          <div className="mt-3">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                  className={["h-full rounded-full bg-cyan-500 transition-all", loadingMastery ? "animate-pulse" : ""].join(" ")}
                  style={{ width: progressPercent == null ? "24%" : `${progressPercent}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">
                {lessonCount ? `${lessonCount} lecciones` : " "}
              </span>
              <span className={done ? "text-cyan-700" : "text-slate-500"}>
                {progressPercent == null ? "..." : `${progressPercent}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function LessonItem({ lesson, onOpenLesson }) {
  const status = String(lesson?.status || "not_started").toLowerCase();
  const title = lesson?.lessonTitle || lesson?.title || "Lección";
  return (
    <button
      onClick={() => onOpenLesson?.(lesson)}
      className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-sky-500/15 text-sky-700 flex items-center justify-center">
          <PlayCircle size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[11px] font-black",
                status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "in_progress"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {getLessonStatusLabel(status)}
            </span>
            {lesson.completedAt ? (
              <span className="text-[11px] text-slate-500">
                {formatLessonDate(lesson.completedAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function ProgressJournalChart({ items }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .map((it, idx) => {
        const value = clampPercent(it?.masteryPercent ?? Number(it?.mastery) * 100 ?? 0);
        const rawDate =
          it?.timestamp || it?.recordedAt || it?.createdAt || it?.updatedAt || null;
        const label = rawDate
          ? new Date(rawDate).toLocaleDateString("es-EC", {
              day: "2-digit",
              month: "short",
            })
          : `M${idx + 1}`;

        return {
          id: it?.id ?? idx,
          value,
          label,
        };
      })
      .filter((point) => Number.isFinite(point.value));
  }, [items]);

  if (!chartData.length) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Aún no hay registros para mostrar en la gráfica.
      </div>
    );
  }

  const width = 560;
  const height = 190;
  const padX = 24;
  const padY = 22;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const stepX = chartData.length > 1 ? plotW / (chartData.length - 1) : 0;

  const points = chartData.map((point, idx) => {
    const x = padX + idx * stepX;
    const y = padY + ((100 - point.value) / 100) * plotH;
    return { ...point, x, y };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L ${(padX + plotW).toFixed(2)} ${(padY + plotH).toFixed(
    2
  )} L ${padX.toFixed(2)} ${(padY + plotH).toFixed(2)} Z`;

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-[210px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Historial de progreso">
          <defs>
            <linearGradient id="masteryLine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="masteryArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <line x1={padX} x2={padX + plotW} y1={padY + plotH} y2={padY + plotH} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={padX} x2={padX} y1={padY} y2={padY + plotH} stroke="#e2e8f0" strokeWidth="1" />

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = padY + ((100 - tick) / 100) * plotH;
            return (
              <g key={tick}>
                <line x1={padX} x2={padX + plotW} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={6} y={y + 4} fontSize="10" fill="#64748b">{tick}%</text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#masteryArea)" />
          <path d={linePath} fill="none" stroke="url(#masteryLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point) => (
            <g key={point.id}>
              <circle cx={point.x} cy={point.y} r="4.3" fill="#0f172a" fillOpacity="0.08" />
              <circle cx={point.x} cy={point.y} r="3.3" fill="#14b8a6" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {chartData.map((point) => (
          <div key={point.id} className="min-w-[60px] text-center">
            <p className="text-[11px] font-extrabold text-slate-800">{point.value}%</p>
            <p className="text-[10px] text-slate-500">{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubjectTopics({ courseId, onOpenTopic, onOpenLesson, refreshToken = 0 }) {
  const [tree, setTree] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);

  const [selectedId, setSelectedId] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  // progreso por topic
  const [topicProgressMap, setTopicProgressMap] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [masteryJournal, setMasteryJournal] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [journalError, setJournalError] = useState("");

  // 1) cargar arbol de temas y progreso agregado del curso
  useEffect(() => {
    let alive = true;

    async function loadAll() {
      setLoadingTree(true);
      setLoadingProgress(true);

      try {
        const [t, progress] = await Promise.all([
          getCourseTopicsTree(courseId),
          getCourseTopicsProgress(courseId),
        ]);

        if (!alive) return;
        setTree(t || []);
        const topicEntries = Array.isArray(progress?.topics) ? progress.topics : [];
        const nextProgressMap = {};
        for (const topic of topicEntries) {
          if (topic?.topicId == null) continue;
          nextProgressMap[topic.topicId] = topic;
        }
        setTopicProgressMap(nextProgressMap);

        // selecciona el primer nodo visible
        const first = flattenTree(t)?.[0];
        if (first?.id) setSelectedId(first.id);
      } catch (e) {
        if (!alive) return;
        setTree([]);
        setTopicProgressMap({});
      } finally {
        if (!alive) return;
        setLoadingTree(false);
        setLoadingProgress(false);
      }
    }

    if (Number.isFinite(courseId) && courseId > 0) loadAll();
    else {
      setLoadingTree(false);
      setLoadingProgress(false);
    }

    return () => {
      alive = false;
    };
  }, [courseId, refreshToken]);

  // 2) cargar detalle del tema seleccionado
  useEffect(() => {
    let alive = true;

    async function loadDetail() {
      if (!selectedId) {
        setDetail(null);
        return;
      }

      setDetailLoading(true);

      try {
        const d = await getTopicById(selectedId);

        if (!alive) return;
        setDetail(d || null);
      } catch (e) {
        if (!alive) return;
        setDetail(null);
      } finally {
        if (!alive) return;
        setDetailLoading(false);
      }
    }

    loadDetail();
    return () => {
      alive = false;
    };
  }, [selectedId, refreshToken]);

  const flatTopics = useMemo(() => flattenTree(tree), [tree]);

  const selectedTopicProgress = useMemo(() => {
    return topicProgressMap[selectedId] || null;
  }, [selectedId, topicProgressMap]);

  useEffect(() => {
    let alive = true;

    async function loadJournal() {
      if (!selectedId) {
        setMasteryJournal([]);
        setJournalError("");
        return;
      }

      try {
        setLoadingJournal(true);
        setJournalError("");
        const response = await getTopicMasteryJournal(selectedId, { limit: 100, offset: 0 });
        if (!alive) return;
        setMasteryJournal(Array.isArray(response?.items) ? response.items : []);
      } catch {
        if (!alive) return;
        setMasteryJournal([]);
        setJournalError("No se pudo cargar el historial de progreso.");
      } finally {
        if (!alive) return;
        setLoadingJournal(false);
      }
    }

    loadJournal();
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const handleOpenInStudy = () => {
    if (!detail) return;
    onOpenTopic?.(detail);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: lista de temas tipo “bonita” */}
      <div className="lg:col-span-5">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-xl overflow-hidden">
          <div className="relative p-5 bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-sky-500/15">
            <div className="absolute inset-0 pointer-events-none opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.24),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.18),transparent_45%)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-600 to-sky-600 text-white flex items-center justify-center shadow-sm">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Temas</h2>
                  <p className="text-xs font-semibold text-slate-600">
                    Elige uno para ver su contenido
                  </p>
                </div>
              </div>

              {(loadingTree || loadingProgress) ? (
                <span className="text-xs font-semibold text-slate-600 inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Cargando
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-700">
                  {loadingProgress ? "Calculando dominio..." : `${flatTopics.length} temas`}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-3">
            {(loadingTree || loadingProgress) ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                Cargando temas...
              </div>
            ) : flatTopics.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                No hay temas para este curso.
              </div>
            ) : (
              flatTopics.map((t) => (
                <TopicCard
                  key={t.id}
                  node={{
                    ...t,
                    progress:
                      topicProgressMap[t.id]?.completionPercentage != null
                        ? topicProgressMap[t.id].completionPercentage / 100
                        : 0,
                  }}
                  isSelected={selectedId === t.id}
                  onSelect={setSelectedId}
                  lessonCount={topicProgressMap[t.id]?.totalLessons || 0}
                  loadingMastery={loadingProgress}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: detalle + subtemas + lecciones */}
      <div className="lg:col-span-7">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-xl overflow-hidden">
          {/* header del panel derecho */}
          <div className="relative p-6 bg-gradient-to-r from-teal-500/12 via-cyan-500/10 to-sky-500/10">
            <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(circle_at_85%_20%,rgba(20,184,166,0.18),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.14),transparent_45%)]" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-extrabold text-teal-800">
                  <Sparkles size={14} />
                  {detail ? "Tema seleccionado" : "Selecciona un tema"}
                </div>

                <h3 className="mt-3 text-2xl font-black text-slate-900">
                  {detail?.name || "Contenido del tema"}
                </h3>
                <p className="mt-1 text-slate-700">
                  {detail?.description || "Selecciona un tema para ver detalles, subtemas y lecciones."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-slate-700 shadow-sm">
                    Progreso: {selectedTopicProgress?.completionPercentage ?? 0}%
                  </span>
                  {/* <span className="rounded-full bg-white/90 px-3 py-1 text-slate-700 shadow-sm">
                    Mastery: {Math.round((selectedTopicProgress?.mastery ?? 0) * 100)}%
                  </span> */}
                  <span className="rounded-full bg-white/90 px-3 py-1 text-slate-700 shadow-sm">
                    Lecciones: {selectedTopicProgress?.completedLessons ?? 0}/{selectedTopicProgress?.totalLessons ?? 0}
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenInStudy}
                disabled={!detail}
                className={[
                  "shrink-0 rounded-2xl px-4 py-2 text-sl font-bold transition w-35 h-10 cursor-pointer",
                  detail
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:brightness-105"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed",
                ].join(" ")}
              >
                Estudiar
              </button>
            </div>
          </div>

          {/* body */}
          <div className="p-6">
            {!selectedId ? (
              <div className="text-slate-500 text-sm">
                Selecciona un tema para ver detalles.
              </div>
            ) : detailLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="animate-spin" size={16} /> Cargando detalle...
              </div>
            ) : !detail ? (
              <div className="text-slate-500 text-sm">
                No se pudo cargar el detalle del tema.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Subtemas */}
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-teal-700" />
                    <h4 className="text-sm font-black text-slate-900">Subtemas</h4>
                  </div>

                  {detail.children?.length ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detail.children.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedId(c.id)}
                          className="text-left rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 cursor-pointer hover:bg-cyan-50 transition"
                        >
                          <p className="font-extrabold text-slate-900">{c.name}</p>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                            {c.description || "Sin descripción"}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No hay subtemas.</p>
                  )}
                </div>

                {/* Lecciones (endpoint agregado por topic) */}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={18} className="text-sky-700" />
                      <h4 className="text-sm font-black text-slate-900">Lecciones</h4>
                    </div>

                    {loadingProgress ? (
                      <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-2">
                        <Loader2 className="animate-spin" size={14} /> Cargando
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600">
                        {selectedTopicProgress?.totalLessons || 0} lecciones
                      </span>
                    )}
                  </div>

                  {loadingProgress ? (
                    <div className="mt-3 text-sm text-slate-500">Cargando lecciones...</div>
                  ) : (selectedTopicProgress?.lessons || []).length ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(selectedTopicProgress?.lessons || []).map((l) => (
                        <LessonItem key={l.lessonId ?? l.id ?? l.lessonTitle} lesson={l} onOpenLesson={onOpenLesson} />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No hay lecciones para este tema.
                    </p>
                  )}
                </div>

                {/* Historial de mastery */}
                {/* <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <LineChart size={18} className="text-cyan-700" />
                      <h4 className="text-sm font-black text-slate-900">Historial de progreso</h4>
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      Dominio actual: {Math.round((selectedTopicProgress?.mastery ?? 0) * 100)}%
                    </span>
                  </div>

                  {loadingJournal ? (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="animate-spin" size={16} /> Cargando historial...
                    </div>
                  ) : journalError ? (
                    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                      {journalError}
                    </div>
                  ) : (
                    <ProgressJournalChart items={masteryJournal} />
                  )}
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
