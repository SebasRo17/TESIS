import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  Timer,
  Loader2,
  ListChecks,
  History,
} from "lucide-react";

import { overallStats } from "../../data/mockData";

import SubjectCard from "./SubjectCard";
import { EduBot3DWithMode } from "../Tutorial/EduBot3D";
import { getCoursesRequest } from "../../services/coursesService";
import { getCourseMastery } from "../../services/masteryService";
import {
  getActiveStudyPlan,
  getNextStudyPlanActivity,
  getStudyPlanHistory,
  updateStudyPlanItemStatus,
} from "../../services/studyPlansService";

const TOUR_KEY = "eduprep-dashboard-tour:v2";

// ===== Utils =====
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getItemStatusMeta(status) {
  const key = String(status || "pending").toLowerCase();
  if (key === "done") {
    return { label: "Completado", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  }
  if (key === "blocked") {
    return { label: "Bloqueado", badge: "bg-rose-100 text-rose-700 border-rose-200" };
  }
  if (key === "in_progress") {
    return { label: "En progreso", badge: "bg-sky-100 text-sky-700 border-sky-200" };
  }
  return { label: "Pendiente", badge: "bg-amber-100 text-amber-700 border-amber-200" };
}

function getContentTypeLabel(type) {
  const key = String(type || "").toLowerCase();
  if (key === "topic") return "Tema";
  if (key === "lesson") return "Lección";
  if (key === "exam") return "Simulador";
  return type ? String(type) : "Actividad";
}

function getRectById(anchorId) {
  const el = document.getElementById(anchorId);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
  };
}

function useAnchorRect(anchorId, deps = []) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (!anchorId) return;

    const compute = () => setRect(getRectById(anchorId));
    compute();

    const el = document.getElementById(anchorId);
    if (!el) return;

    const ro = new ResizeObserver(compute);
    ro.observe(el);

    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rect;
}

// ===== Muñeco animado =====
function EduBot({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="body" x1="40" y1="20" x2="120" y2="150">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="glass" x1="40" y1="28" x2="120" y2="128">
          <stop stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="80" cy="148" rx="40" ry="10" fill="#0f172a" opacity="0.08" />

      {/* Body bounce group */}
      <g className="edubot-float">
        {/* Body */}
        <rect
          x="44"
          y="22"
          width="72"
          height="104"
          rx="28"
          fill="url(#glass)"
        />
        <rect
          x="50"
          y="28"
          width="60"
          height="92"
          rx="24"
          fill="url(#body)"
          opacity="0.12"
        />
        <rect
          x="52"
          y="34"
          width="56"
          height="78"
          rx="22"
          fill="white"
          opacity="0.92"
        />

        {/* Face */}
        <circle cx="68" cy="74" r="7" fill="#0f172a" opacity="0.9" />
        <circle cx="92" cy="74" r="7" fill="#0f172a" opacity="0.9" />
        <circle cx="70" cy="72" r="2.2" fill="white" opacity="0.95" />
        <circle cx="94" cy="72" r="2.2" fill="white" opacity="0.95" />
        <path
          d="M68 90c3.8 3.6 8 5.3 12 5.3S88 93.6 92 90"
          stroke="#0f172a"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.82"
        />

        {/* Left arm */}
        <path
          d="M44 92c-10 5-16 14-16 24"
          stroke="#0f172a"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.1"
        />
        <path
          d="M46 92c-11 5-18 15-18 26"
          stroke="#14b8a6"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Right arm waving */}
        <g className="edubot-wave" style={{ transformOrigin: "118px 86px" }}>
          <path
            d="M114 92c12 3 22 10 26 22"
            stroke="#0f172a"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.1"
          />
          <path
            d="M112 92c13 3 24 11 28 24"
            stroke="#06b6d4"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* hand */}
          <circle cx="142" cy="122" r="8" fill="#06b6d4" opacity="0.95" />
          <circle cx="142" cy="122" r="8" fill="#0f172a" opacity="0.06" />
        </g>

        {/* little antenna */}
        <path
          d="M80 22c0-10 7-18 18-18"
          stroke="#0f172a"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.18"
        />
        <circle cx="104" cy="6" r="5" fill="#06b6d4" opacity="0.9" />
      </g>
    </svg>
  );
}

// ===== Spotlight Tour =====
function DashboardTour({
  open,
  stepIndex,
  steps,
  onClose,
  onNext,
  onPrev,
  anchorId,
}) {
  const rect = useAnchorRect(anchorId, [open, stepIndex, anchorId]);
  const step = steps[stepIndex];

  useEffect(() => {
    if (!open) return;
    const el = anchorId ? document.getElementById(anchorId) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [open, stepIndex, anchorId]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  if (!open) return null;

  // Spotlight padding
  const pad = 10;

  const spot = rect
    ? {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    }
    : { top: 80, left: 24, width: 320, height: 120 };

  // Bubble positioning (prefer near spotlight)
  const bubble = (() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const bubbleW = 700;
    const bubbleH = 320;

    if (stepIndex === 1) {
      // Paso 2: mantenemos el modal arriba para dejar limpia la hoja de ruta.
      return {
        left: clamp(spot.left + spot.width / 2 - bubbleW / 2, 16, vw - 16 - bubbleW),
        top: clamp(spot.top - bubbleH - 18, 12, vh - 16 - bubbleH),
      };
    }

    if (stepIndex === 3) {
      // Paso 4: modal bien arriba para que el robot de abajo apunte al spotlight.
      return {
        left: clamp(spot.left + spot.width / 2 - bubbleW / 2, 16, vw - 16 - bubbleW),
        top: clamp(spot.top - bubbleH - 22, 12, vh - 16 - bubbleH),
      };
    }

    const preferredLeft = spot.left + spot.width / 2 - bubbleW / 2;
    const preferredTop = spot.top + spot.height + 16;

    const belowFits = preferredTop + bubbleH < vh - 16;
    const top = belowFits ? preferredTop : spot.top - 16 - bubbleH;

    return {
      left: clamp(preferredLeft, 16, vw - 16 - bubbleW),
      top: clamp(top, 16, vh - 16 - bubbleH),
    };
  })();

  const robot = (() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const size = vw < 768 ? 130 : 220;

    let preferredLeft = spot.left - size - 28;
    let preferredTop = spot.top + spot.height / 2 - size / 2;
    let direction = "right";

    if (stepIndex === 0) {
      preferredLeft = spot.left - size + 248;
      preferredTop = spot.top + spot.height / 2 - size / 2 + 215;
      direction = "right";
    } else if (stepIndex === 1) {
      preferredLeft = spot.left + spot.width + 24;
      preferredTop = spot.top + spot.height / 2 - size / 2 + 4;
      direction = "left";
    } else if (stepIndex === 2) {
      preferredLeft = spot.left - size - 24;
      preferredTop = spot.top + spot.height / 2 - size / 2 + 2;
      direction = "right";
    } else if (stepIndex === 3) {
      preferredLeft = spot.left + spot.width / 2 - size / 2;
      preferredTop = spot.top + spot.height + 18;
      direction = "left";
    }

    return {
      left: clamp(preferredLeft, 10, vw - size - 10),
      top: clamp(preferredTop, 10, vh - size - 10),
      size,
      direction,
    };
  })();

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Spotlight overlay using box-shadow hack */}
      <div
        className="absolute rounded-3xl transition-all duration-300"
        style={{
          top: spot.top,
          left: spot.left,
          width: spot.width,
          height: spot.height,
          boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.45)",
        }}
      />

      {/* Glow border around spotlight */}
      <div
        className="absolute rounded-3xl pointer-events-none"
        style={{
          top: spot.top,
          left: spot.left,
          width: spot.width,
          height: spot.height,
          boxShadow:
            "0 0 0 2px rgba(45, 212, 191, 0.65), 0 0 40px rgba(6, 182, 212, 0.25)",
        }}
      />

      <div
        className="absolute pointer-events-none transition-all duration-700 ease-out"
        style={{
          top: robot.top,
          left: robot.left,
          width: robot.size,
          height: robot.size,
          filter: "drop-shadow(0 16px 24px rgba(2, 132, 199, 0.2))",
        }}
      >
        <EduBot3DWithMode
          mode="tour"
          stepIndex={stepIndex}
          pointDirection={robot.direction}
          interactive={false}
        />
      </div>

      {/* Bubble */}
      <div
        className="absolute w-[700px] max-w-[96vw]"
        style={{ top: bubble.top, left: bubble.left }}
      >
        <div className="relative">
          <div className="relative overflow-visible rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-sky-500/10" />

            {/* little pointer toward spotlight */}
            {/* Pointer: apunta hacia el spotlight */}
            {(() => {
              const spotCenter = spot.top + spot.height / 2;
              const bubbleBottom = bubble.top + 320; // aprox altura del bubble
              const isAbove = bubble.top + 320 < spotCenter; // modal está arriba del spotlight

              return isAbove ? (
                // Modal arriba → flecha apunta ABAJO
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/90 border-r border-b border-white/50"
                  aria-hidden="true"
                />
              ) : (
                // Modal abajo → flecha apunta ARRIBA
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/90 border-l border-t border-white/50"
                  aria-hidden="true"
                />
              );
            })()}

            <div className="relative p-5 sm:p-6">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    {step.title}
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"
                    aria-label="Cerrar tutorial"
                    title="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2 text-base text-slate-700 leading-relaxed">
                  {step.text}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Paso {stepIndex + 1} de {steps.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onPrev}
                      disabled={stepIndex === 0}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 text-slate-800 text-xs font-extrabold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Atrás
                    </button>

                    <button
                      type="button"
                      onClick={onNext}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-extrabold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition"
                    >
                      {stepIndex === steps.length - 1
                        ? "¡Entendido!"
                        : "Siguiente"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Hint extra (para adolescentes, tono friendly) */}
                <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] text-slate-600">
                  Tip: Si te pierdes, vuelve a abrir el tutorial con el botón{" "}
                  <span className="font-extrabold text-slate-800">
                    “Ver tutorial”
                  </span>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animations CSS-in-JSX (sin archivos extra) */}
        <style>{`
          .edubot-float { animation: edubotFloat 2.6s ease-in-out infinite; }
          .edubot-wave { animation: edubotWave 1.3s ease-in-out infinite; }
          @keyframes tutorialPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.06); opacity: 0.92; }
          }
          @keyframes edubotFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes edubotWave {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(18deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ===== Main =====
export default function Dashboard({
  onSubjectSelect,
  onGeneralSimulator,
  onStudyPlanSelect,
}) {
  const {
    totalProgress,
    completedTopics,
    totalTopics,
    studyHours,
    simulacros,
  } = overallStats;

  // ✅ 1) STATES PRIMERO
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);
  const [coursePlansSummary, setCoursePlansSummary] = useState([]);
  const [coursePlansLoading, setCoursePlansLoading] = useState(false);
  const [coursePlansError, setCoursePlansError] = useState("");
  const [expandedHistoryCourseId, setExpandedHistoryCourseId] = useState(null);
  const [updatingCourseItemKey, setUpdatingCourseItemKey] = useState("");
  const [courseMasteryMap, setCourseMasteryMap] = useState({});
  // const tipsRect = useAnchorRect("tips-section", [tourOpen]);

  // const tipsBot = useMemo(() => {
  //   if (tourOpen || !tipsRect) return null;

  //   const vw = window.innerWidth;
  //   const vh = window.innerHeight;
  //   const tipsBottom = tipsRect.top + tipsRect.height;
  //   const isTipsVisible = tipsBottom > 80 && tipsRect.top < vh - 40;
  //   if (!isTipsVisible) return null;

  //   const size = vw < 768 ? 126 : 176;

  //   const mobileTop = tipsRect.top + 48;
  //   const desktopTop = tipsRect.top + 74;

  //   return {
  //     size,
  //     // Izquierda, como primera columna de Tips.
  //     left: clamp(tipsRect.left + 8, 10, vw - size - 10),
  //     top: clamp(vw < 768 ? mobileTop : desktopTop, 10, vh - size - 10),
  //   };
  // }, [tipsRect, tourOpen]);

  const handleSubjectClick = (code) => {
    setSelectedSubjectCode(code);
    onSubjectSelect?.(code);
  };

  // ✅ 2) useMemo DESPUÉS (porque usa "courses")
  const subjectsFromCourses = useMemo(() => {
    return courses.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      status: c.status,
      progress: 0,
      completedTopics: 0,
      totalTopics: 0,
    }));
  }, [courses]);

  // Steps (anchors)
  const steps = useMemo(
    () => [
      {
        title: "¡Bienvenido/a a EduPrep!",
        text: "Soy EduBot 🤖. Aquí verás tu progreso: cuánto avanzaste, tus horas de estudio y cuántos simulacros llevas.",
        anchorId: "kpi-section",
      },
      {
        title: "Hoja de Ruta Semanal",
        text: "Este es tu plan por semanas. Te dice qué hacer, cuánto falta y te lleva al plan completo.",
        anchorId: "roadmap-section",
      },
      {
        title: "Materias de Estudio",
        text: "Entra a una materia para estudiar: verás progreso, temas completados y actividades.",
        anchorId: "subjects-section",
      },
      {
        title: "Tips y Consejos",
        text: "Aquí tienes consejos rápidos para estudiar mejor y rendir más en el examen. ¡Úsalos diario!",
        anchorId: "tips-section",
      },
    ],
    []
  );

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      setTourOpen(true);
      setTourStep(0);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const loadCoursePlans = async () => {
      if (!courses.length) {
        setCoursePlansSummary([]);
        setCoursePlansError("");
        return;
      }

      try {
        setCoursePlansLoading(true);
        setCoursePlansError("");

        const results = await Promise.allSettled(
          courses.map(async (course) => {
            const [planRes, nextRes, historyRes] = await Promise.allSettled([
              getActiveStudyPlan(course.id),
              getNextStudyPlanActivity(course.id),
              getStudyPlanHistory(course.id),
            ]);

            const plan = planRes.status === "fulfilled" ? planRes.value : null;
            const items = Array.isArray(plan?.items) ? plan.items : [];
            const nextActivity =
              nextRes.status === "fulfilled" ? nextRes.value || null : null;
            const history =
              historyRes.status === "fulfilled" && Array.isArray(historyRes.value)
                ? historyRes.value
                : [];
            const total = items.length;
            const done = items.filter(
              (item) => String(item.status).toLowerCase() === "done"
            ).length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return {
              courseId: course.id,
              courseCode: course.code,
              courseTitle: course.title,
              hasPlan: Boolean(plan),
              planId: plan?.id || null,
              planState: plan?.state || null,
              items,
              nextActivity,
              history,
              totalItems: total,
              doneItems: done,
              progress,
            };
          })
        );

        if (!alive) return;

        const summary = results.map((result, index) => {
          if (result.status === "fulfilled") return result.value;

          const fallbackCourse = courses[index];
          return {
            courseId: fallbackCourse.id,
            courseCode: fallbackCourse.code,
            courseTitle: fallbackCourse.title,
            hasPlan: false,
            planState: null,
            totalItems: 0,
            doneItems: 0,
            progress: 0,
          };
        });

        setCoursePlansSummary(summary);
      } catch (err) {
        if (!alive) return;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "No se pudo cargar la hoja de ruta semanal.";
        setCoursePlansError(msg);
      } finally {
        if (!alive) return;
        setCoursePlansLoading(false);
      }
    };

    loadCoursePlans();

    return () => {
      alive = false;
    };
  }, [courses]);

  useEffect(() => {
    let alive = true;

    const loadCourseMastery = async () => {
      if (!courses.length) {
        setCourseMasteryMap({});
        return;
      }

      try {
        const results = await Promise.allSettled(
          courses.map((course) => getCourseMastery(course.id))
        );

        if (!alive) return;

        const nextMap = {};
        results.forEach((result, index) => {
          const courseId = courses[index]?.id;
          if (!courseId) return;
          if (result.status === "fulfilled") {
            nextMap[courseId] = Math.max(
              0,
              Math.min(100, Math.round(Number(result.value?.masteryPercent ?? result.value?.mastery ?? 0)))
            );
          }
        });

        setCourseMasteryMap(nextMap);
      } catch {
        if (!alive) return;
        setCourseMasteryMap({});
      }
    };

    loadCourseMastery();

    return () => {
      alive = false;
    };
  }, [courses]);

  const handleUpdateCoursePlanItem = async (courseId, itemId, status = "done") => {
    if (!courseId || !itemId) return;

    try {
      setUpdatingCourseItemKey(`${courseId}:${itemId}`);
      setCoursePlansError("");
      await updateStudyPlanItemStatus(itemId, status);

      const [plan, next, history] = await Promise.all([
        getActiveStudyPlan(courseId),
        getNextStudyPlanActivity(courseId),
        getStudyPlanHistory(courseId),
      ]);

      const items = Array.isArray(plan?.items) ? plan.items : [];
      const total = items.length;
      const done = items.filter(
        (item) => String(item.status).toLowerCase() === "done"
      ).length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      setCoursePlansSummary((prev) =>
        prev.map((entry) => {
          if (entry.courseId !== courseId) return entry;

          return {
            ...entry,
            hasPlan: Boolean(plan),
            planId: plan?.id || null,
            planState: plan?.state || null,
            items,
            nextActivity: next || null,
            history: Array.isArray(history) ? history : [],
            totalItems: total,
            doneItems: done,
            progress,
          };
        })
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo actualizar el estado de la actividad.";
      setCoursePlansError(msg);
    } finally {
      setUpdatingCourseItemKey("");
    }
  };

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError(null);

        const data = await getCoursesRequest();

        if (!alive) return;

        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "No se pudieron cargar los cursos.";
        setCoursesError(msg);
      } finally {
        if (!alive) return;
        setCoursesLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const closeTour = () => {
    localStorage.setItem(TOUR_KEY, "1");
    setTourOpen(false);
  };

  const nextTour = () => {
    if (tourStep >= steps.length - 1) {
      closeTour();
      return;
    }
    setTourStep((s) => s + 1);
  };

  const prevTour = () => setTourStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen w-full relative bg-slate-50 overflow-hidden">
      {/* Fondo premium (aurora + noise) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100" />
        <div className="absolute -top-24 left-[-120px] w-[520px] h-[520px] bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-16 right-[-140px] w-[560px] h-[560px] bg-sky-400/18 rounded-full blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/3 w-[720px] h-[720px] bg-cyan-300/14 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard de Preparación
            </h1>
            <p className="mt-2 text-slate-600">
              Sigue tu progreso y continúa preparándote para tu examen de
              admisión.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTourOpen(true);
                setTourStep(0);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span className="text-sm font-extrabold text-slate-800">
                Ver tutorial
              </span>
            </button>

            <button
              type="button"
              onClick={onGeneralSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm"
            >
              <Award className="w-4 h-4 text-slate-700" />
              <span className="text-sm font-extrabold text-slate-800">
                Simulacro general
              </span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <section
          id="kpi-section"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <KpiCard
            title="Progreso general"
            value={`${totalProgress}%`}
            Icon={TrendingUp}
            gradient="from-teal-500 to-cyan-500"
          />
          <KpiCard
            title="Temas completados"
            value={`${completedTopics}/${totalTopics}`}
            Icon={Target}
            gradient="from-emerald-500 to-lime-500"
          />
          <KpiCard
            title="Tiempo de estudio"
            value={`${studyHours}h`}
            Icon={Clock}
            gradient="from-orange-500 to-amber-500"
          />
          <KpiCard
            title="Simulacros"
            value={`${simulacros}`}
            Icon={Award}
            gradient="from-violet-500 to-fuchsia-500"
          />
        </section>

        {/* HOJA DE RUTA */}
        <section id="roadmap-section" className="mt-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Hoja de Ruta Semanal
          </h2>

          {coursePlansError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {coursePlansError}
            </div>
          ) : null}

          {coursePlansLoading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando hoja de ruta semanal...
            </div>
          ) : coursePlansSummary.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              No hay cursos para mostrar.
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {coursePlansSummary.map((entry) => {
                const stateLabel = entry.hasPlan
                  ? String(entry.planState || "active").toUpperCase()
                  : "SIN PLAN";
                const mastery =
                  courseMasteryMap[entry.courseId] != null
                    ? courseMasteryMap[entry.courseId]
                    : null;
                const progressValue = mastery != null ? mastery : entry.progress;

                const isHistoryOpen = expandedHistoryCourseId === entry.courseId;

                return (
                  <article
                    key={entry.courseId}
                    className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg"
                  >
                    <div className="relative p-6 sm:p-7">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">{entry.courseTitle}</h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{entry.courseCode}</p>
                        </div>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
                          {stateLabel}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                        <span>{mastery != null ? "Dominio del curso" : `${entry.doneItems}/${entry.totalItems} completadas`}</span>
                        <span className="font-extrabold text-slate-900">{progressValue}%</span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-slate-700" />
                            <p className="text-sm font-extrabold text-slate-900">Plan semanal</p>
                          </div>

                          {!entry.hasPlan ? (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              Plan activo no encontrado.
                            </div>
                          ) : (entry.items || []).length === 0 ? (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              El plan no tiene actividades.
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {(entry.items || []).slice(0, 6).map((item) => {
                                const status = String(item.status || "pending").toLowerCase();
                                const isDone = status === "done";
                                const itemKey = `${entry.courseId}:${item.id}`;
                                const isUpdating = updatingCourseItemKey === itemKey;

                                return (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">
                                          {getContentTypeLabel(item.type || item.contentRefType)} #{item.contentRefId}
                                        </p>
                                        <span className={["mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold", getItemStatusMeta(item.status).badge].join(" ")}>
                                          {getItemStatusMeta(item.status).label}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCoursePlanItem(entry.courseId, item.id, "done")}
                                        disabled={isDone || isUpdating}
                                        className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                        {isDone ? "Hecho" : "Marcar realizado"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {entry.planId ? (
                            <button
                              type="button"
                              onClick={() => onStudyPlanSelect?.(entry.planId)}
                              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-2 text-sm font-extrabold text-white"
                            >
                              Ver plan completo <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-700" />
                            <p className="text-sm font-extrabold text-slate-900">Siguiente actividad</p>
                          </div>

                          {!entry.nextActivity ? (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              No hay una siguiente actividad disponible.
                            </div>
                          ) : (
                            <>
                              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                <p className="text-sm font-bold text-slate-900">
                                  {getContentTypeLabel(entry.nextActivity.type || entry.nextActivity.contentRefType)} #{entry.nextActivity.contentRefId}
                                </p>
                                <span className={["mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold", getItemStatusMeta(entry.nextActivity.status).badge].join(" ")}>
                                  {getItemStatusMeta(entry.nextActivity.status).label}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleUpdateCoursePlanItem(entry.courseId, entry.nextActivity.id, "done")}
                                disabled={updatingCourseItemKey === `${entry.courseId}:${entry.nextActivity.id}`}
                                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-700 disabled:opacity-60"
                              >
                                {updatingCourseItemKey === `${entry.courseId}:${entry.nextActivity.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                Marcar como realizado
                              </button>
                            </>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-2">
                              <History className="w-4 h-4 text-slate-700" />
                              <p className="text-sm font-extrabold text-slate-900">Historial</p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedHistoryCourseId((prev) =>
                                  prev === entry.courseId ? null : entry.courseId
                                )
                              }
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-700"
                            >
                              {isHistoryOpen ? "Ocultar" : "Ver historial"}
                            </button>
                          </div>

                          {!isHistoryOpen ? (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              Presiona "Ver historial" para revisar versiones.
                            </div>
                          ) : (entry.history || []).length === 0 ? (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              Sin historial disponible.
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {(entry.history || []).slice(0, 5).map((plan) => (
                                <div
                                  key={plan.id}
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                                >
                                  <p className="text-sm font-bold text-slate-800">Versión {plan.version}</p>
                                  <span className="text-xs font-extrabold text-slate-500">
                                    {plan.itemsCount || 0} items
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* MATERIAS */}
        <section id="subjects-section" className="mt-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Materias de Estudio
          </h2>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coursesLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[120px] w-full animate-pulse rounded-2xl border border-slate-200 bg-white"
                  />
                ))}
              </div>
            ) : coursesError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {coursesError}
              </div>
            ) : subjectsFromCourses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                No hay cursos disponibles aún.
              </div>
            ) : (
              subjectsFromCourses.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={selectedSubjectCode === subject.code}
                  onClick={() => handleSubjectClick(subject.code)}
                />
              ))
            )}
          </div>
        </section>

        {/* TIPS Y CONSEJOS */}
        <section id="tips-section" className="mt-10">
          <div className="flex items-start gap-15">

            {/* Robot a la izquierda — parte del flujo, no fixed */}
            <div
              className="hidden md:block shrink-0"
              style={{ width: 200, height: 280, marginTop: 32, marginRight: -16 }}
            >
              <EduBot3DWithMode mode="tips" interactive={false} />
            </div>

            {/* Contenido a la derecha */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Tips y Consejos
              </h2>
              <p className="mt-2 text-slate-600">
                Recomendaciones cortas para estudiar mejor y rendir más.
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <TipCard
                  Icon={Timer}
                  title="Método 25/5 (Pomodoro)"
                  text="Estudia 25 minutos, descansa 5. Repite 4 veces y toma un descanso largo."
                  accent="from-teal-500 to-cyan-500"
                />
                <TipCard
                  Icon={Lightbulb}
                  title="Aprende con ejemplos"
                  text="Si una regla te confunde, busca 2 ejemplos y luego crea uno tú."
                  accent="from-indigo-500 to-sky-500"
                />
                <TipCard
                  Icon={ShieldCheck}
                  title="Simulacro con calma"
                  text="No corras. Primero asegúrate de entender la pregunta, luego responde."
                  accent="from-cyan-500 to-sky-500"
                />
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onGeneralSimulator}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm hover:shadow-md transition"
                >
                  <Award className="w-5 h-5 text-slate-700" />
                  <span className="text-sm font-extrabold text-slate-800">
                    Practicar con un simulacro general
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DashboardTour
        open={tourOpen}
        stepIndex={tourStep}
        steps={steps}
        anchorId={steps[tourStep]?.anchorId}
        onClose={closeTour}
        onNext={nextTour}
        onPrev={prevTour}
      />

      {/* {tipsBot ? (
        <div
          className="fixed z-[35] pointer-events-none transition-all duration-700 ease-out"
          style={{
            top: tipsBot.top,
            left: tipsBot.left,
            width: tipsBot.size,
            height: tipsBot.size,
            filter: "drop-shadow(0 14px 24px rgba(15, 23, 42, 0.2))",
          }}
        >
          <EduBot3DWithMode mode="tips" interactive={false} />
        </div>
      ) : null} */}
    </div>
  );
}

// ===== Components =====
function KpiCard({ title, value, Icon, gradient }) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-xl`}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),transparent_55%)]" />

      {/* watermark icon */}
      <div className="absolute -right-8 -top-10 opacity-[0.18] pointer-events-none">
        <Icon className="w-40 h-40 text-white" />
      </div>

      {/* decor circles */}
      <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full border border-white/25 opacity-80 pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full border border-white/25 opacity-80 pointer-events-none" />
      <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full border border-white/25 opacity-80 pointer-events-none" />

      <div className="relative p-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-white/85">{title}</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight">{value}</p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </article>
  );
}

function TipCard({ Icon, title, text, accent }) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg p-7">
      <div className="absolute -right-10 -top-12 opacity-[0.10] pointer-events-none">
        <Icon className="w-44 h-44 text-slate-900" />
      </div>

      <div className="relative">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold text-white bg-gradient-to-r ${accent}`}
        >
          <Sparkles className="w-4 h-4" /> TIP
        </div>

        <h3 className="mt-3 text-lg font-extrabold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
      </div>
    </article>
  );
}
