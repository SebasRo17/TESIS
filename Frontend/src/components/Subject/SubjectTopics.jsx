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
} from "lucide-react";

import { getCourseTopicsTree, getTopicById } from "../../services/topicsService";
import { getLessonsByCourse, getLessonsByTopic } from "../../services/lessonsService";

/**
 * Helpers
 */
function flattenTree(nodes) {
  const out = [];
  const walk = (arr) => {
    for (const n of arr) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes ?? []);
  return out;
}

function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function pseudoProgressFromId(id) {
  // solo para demo visual si aún no tienes progreso real
  // quítalo cuando tengas % real por usuario
  const v = (Number(id || 1) % 10) / 10;
  return clamp01(v === 0 ? 0.2 : v);
}

function TopicCard({ node, isSelected, onSelect, lessonCount }) {
  const progress = clamp01(node.progress ?? pseudoProgressFromId(node.id));
  const done = progress >= 1;

  return (
    <button
      onClick={() => onSelect(node.id)}
      className={[
        "w-full text-left rounded-2xl border p-4 transition group relative overflow-hidden",
        isSelected
          ? "border-emerald-200 bg-emerald-50/60 shadow-sm"
          : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      {/* glow suave */}
      {isSelected ? (
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
      ) : null}

      <div className="relative flex items-start gap-3">
        <div
          className={[
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
            done ? "bg-emerald-600 text-white" : "bg-emerald-500/15 text-emerald-700",
          ].join(" ")}
        >
          {done ? <CheckCircle2 size={20} /> : <Circle size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 truncate">{node.name}</p>
              <p className="text-sm text-slate-600 line-clamp-1">
                {node.description || " "}
              </p>
            </div>

            <ChevronRight className="text-slate-400 group-hover:text-slate-700" size={18} />
          </div>

          <div className="mt-3">
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">
                {lessonCount ? `${lessonCount} lecciones` : " "}
              </span>
              <span className={done ? "text-emerald-700" : "text-slate-500"}>
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function LessonItem({ lesson, onOpenLesson }) {
  return (
    <button
      onClick={() => onOpenLesson?.(lesson)}
      className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-sky-500/15 text-sky-700 flex items-center justify-center">
          <PlayCircle size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">{lesson.title}</p>
          <p className="text-xs text-slate-500">
            {lesson.canonicalSlug ? `Slug: ${lesson.canonicalSlug}` : " "}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function SubjectTopics({ courseId, onOpenTopic, onOpenLesson }) {
  const [tree, setTree] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);

  const [selectedId, setSelectedId] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  // lecciones
  const [courseLessons, setCourseLessons] = useState([]);
  const [loadingCourseLessons, setLoadingCourseLessons] = useState(false);

  const [topicLessons, setTopicLessons] = useState([]);
  const [loadingTopicLessons, setLoadingTopicLessons] = useState(false);

  // 1) cargar arbol + lecciones del curso (para contar por tema)
  useEffect(() => {
    let alive = true;

    async function loadAll() {
      setLoadingTree(true);
      setLoadingCourseLessons(true);

      try {
        const [t, lessons] = await Promise.all([
          getCourseTopicsTree(courseId),
          getLessonsByCourse(courseId),
        ]);

        if (!alive) return;
        setTree(t || []);
        setCourseLessons(lessons || []);

        // selecciona el primer nodo visible
        const first = flattenTree(t)?.[0];
        if (first?.id) setSelectedId(first.id);
      } catch (e) {
        if (!alive) return;
        setTree([]);
        setCourseLessons([]);
      } finally {
        if (!alive) return;
        setLoadingTree(false);
        setLoadingCourseLessons(false);
      }
    }

    if (Number.isFinite(courseId) && courseId > 0) loadAll();
    else {
      setLoadingTree(false);
      setLoadingCourseLessons(false);
    }

    return () => {
      alive = false;
    };
  }, [courseId]);

  // 2) cargar detalle del tema + lecciones por tema
  useEffect(() => {
    let alive = true;

    async function loadDetailAndLessons() {
      if (!selectedId) {
        setDetail(null);
        setTopicLessons([]);
        return;
      }

      setDetailLoading(true);
      setLoadingTopicLessons(true);

      try {
        const [d, lessons] = await Promise.all([
          getTopicById(selectedId),
          getLessonsByTopic(selectedId),
        ]);

        if (!alive) return;
        setDetail(d || null);
        setTopicLessons(lessons || []);
      } catch (e) {
        if (!alive) return;
        setDetail(null);
        setTopicLessons([]);
      } finally {
        if (!alive) return;
        setDetailLoading(false);
        setLoadingTopicLessons(false);
      }
    }

    loadDetailAndLessons();
    return () => {
      alive = false;
    };
  }, [selectedId]);

  // conteo de lecciones por primaryTopicId
  const lessonsCountMap = useMemo(() => {
    const map = {};
    for (const l of courseLessons || []) {
      const k = l.primaryTopicId;
      if (!k) continue;
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [courseLessons]);

  const flatTopics = useMemo(() => flattenTree(tree), [tree]);

  const handleOpenInStudy = () => {
    if (!detail) return;
    onOpenTopic?.(detail);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: lista de temas tipo “bonita” */}
      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-violet-500/10 relative">
            <div className="absolute inset-0 pointer-events-none opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_45%)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Temas</h2>
                  <p className="text-xs font-semibold text-slate-600">
                    Elige uno para ver su contenido
                  </p>
                </div>
              </div>

              {(loadingTree || loadingCourseLessons) ? (
                <span className="text-xs font-semibold text-slate-600 inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Cargando
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-700">
                  {flatTopics.length} temas
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-3">
            {(loadingTree || loadingCourseLessons) ? (
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
                  node={t}
                  isSelected={selectedId === t.id}
                  onSelect={setSelectedId}
                  lessonCount={lessonsCountMap[t.id] || 0}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: detalle + subtemas + lecciones */}
      <div className="lg:col-span-7">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* header del panel derecho */}
          <div className="relative p-6 bg-gradient-to-r from-emerald-500/12 via-sky-500/10 to-violet-500/10">
            <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.14),transparent_45%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <Sparkles size={14} />
                  {detail ? "Tema seleccionado" : "Selecciona un tema"}
                </div>

                <h3 className="mt-3 text-2xl font-black text-slate-900">
                  {detail?.name || "Contenido del tema"}
                </h3>
                <p className="mt-1 text-slate-700">
                  {detail?.description || "Selecciona un tema para ver detalles, subtemas y lecciones."}
                </p>
              </div>

              <button
                onClick={handleOpenInStudy}
                disabled={!detail}
                className={[
                  "shrink-0 rounded-2xl px-4 py-2 text-sm font-extrabold transition",
                  detail
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
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
                    <BookOpen size={18} className="text-emerald-700" />
                    <h4 className="text-sm font-black text-slate-900">Subtemas</h4>
                  </div>

                  {detail.children?.length ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detail.children.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedId(c.id)}
                          className="text-left rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 hover:bg-emerald-50 transition"
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

                {/* Lecciones (endpoint real) */}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={18} className="text-sky-700" />
                      <h4 className="text-sm font-black text-slate-900">Lecciones</h4>
                    </div>

                    {loadingTopicLessons ? (
                      <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-2">
                        <Loader2 className="animate-spin" size={14} /> Cargando
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600">
                        {topicLessons.length} lecciones
                      </span>
                    )}
                  </div>

                  {loadingTopicLessons ? (
                    <div className="mt-3 text-sm text-slate-500">Cargando lecciones...</div>
                  ) : topicLessons.length ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {topicLessons.map((l) => (
                        <LessonItem key={l.id} lesson={l} onOpenLesson={onOpenLesson} />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No hay lecciones para este tema.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
