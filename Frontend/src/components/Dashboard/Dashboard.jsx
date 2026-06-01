import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  History,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Timer,
  ListChecks,
  Circle
} from "lucide-react";

import { EduBot3DWithMode } from "../Tutorial/EduBot3D";
import { getCoursesRequest } from "../../services/coursesService";
import { getCourseMastery } from "../../services/masteryService";
import { getCourseProgress, getRecentProgress, getProgressSummary } from "../../services/progressService";
import {
  getActiveStudyPlan,
  getNextStudyPlanActivity,
  getStudyPlanHistory,
  updateStudyPlanItemStatus,
} from "../../services/studyPlansService";

const TOUR_KEY = "eduprep-dashboard-tour:v3";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getRectById(anchorId) {
  const el = document.getElementById(anchorId);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function useAnchorRect(anchorId, deps = []) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (!anchorId) return undefined;

    const updateRect = () => setRect(getRectById(anchorId));
    updateRect();

    const element = document.getElementById(anchorId);
    if (!element) return undefined;

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(element);

    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rect;
}

function toSafeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "done" || value === "completed" || value === "complete") return "Completado";
  if (value === "in_progress" || value === "progress") return "En progreso";
  if (value === "pending" || value === "todo") return "Pendiente";
  return status || "Sin estado";
}

function getPlanItemStatusMeta(status) {
  const value = String(status || "pending").toLowerCase();
  if (value === "done" || value === "completed" || value === "complete") {
    return {
      label: "Realizado",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      checked: true,
    };
  }

  if (value === "blocked") {
    return {
      label: "Bloqueado",
      badge: "bg-rose-100 text-rose-700 border-rose-200",
      checked: false,
    };
  }

  return {
    label: "Pendiente",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    checked: false,
  };
}

function getPlanItemActionLabel(item) {
  const refType = String(item?.contentRefType || item?.type || "").toLowerCase();
  if (refType === "exam") return "Ir al simulador";
  if (refType === "lesson") return "Ir a la lección";
  if (refType === "topic") return "Ir al tema";
  return "Ir a la actividad";
}

function getPlanItemTypeLabel(type) {
  const value = String(type || "").toLowerCase();
  if (value === "lesson") return "Lección";
  if (value === "topic") return "Tema";
  if (value === "variant") return "Variante";
  if (value === "item") return "Ítem";
  if (value === "exam") return "Simulador";
  if (value === "study") return "Estudio";
  if (value === "assessment") return "Evaluación";
  return type ? String(type) : "Actividad";
}

function getPlanItemTarget(course, item) {
  const refType = String(item?.contentRefType || item?.type || "").toLowerCase();
  const courseTarget = course?.code || course?.slug || course?.id;
  const refId = item?.contentRefId ?? item?.id ?? null;

  if (refType === "exam") {
    return { kind: "route", path: `/app/subject/${courseTarget}/simulator` };
  }

  if (refType === "lesson" || refType === "topic") {
    const params = new URLSearchParams({
      refType,
      refId: String(refId ?? ""),
    });
    return { kind: "route", path: `/app/subject/${courseTarget}?${params.toString()}` };
  }

  return { kind: "route", path: `/app/subject/${courseTarget}` };
}

function KpiCard({ title, value, detail, Icon, accent }) {
  return (
    <article className={`relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${accent} p-5 text-white shadow-lg`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_42%)]" />
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs font-semibold text-white/80">{detail}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Icon className="h-6 w-6" />
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

function DashboardTour({ open, stepIndex, steps, anchorId, onClose, onNext, onPrev }) {
  const rect = useAnchorRect(anchorId, [open, stepIndex, anchorId]);
  const step = steps[stepIndex] || steps[0];

  useEffect(() => {
    if (!open) return;

    const element = anchorId ? document.getElementById(anchorId) : null;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [open, stepIndex, anchorId]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [open]);

  if (!open || !step) return null;

  const pad = 10;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const spotlight = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : { top: 96, left: 24, width: 360, height: 140 };

  const bubbleWidth = viewportWidth < 768 ? viewportWidth - 24 : 720;
  const bubbleHeight = viewportWidth < 768 ? 300 : 340;

  const bubbleLeft = clamp(
    spotlight.left + spotlight.width / 2 - bubbleWidth / 2,
    12,
    viewportWidth - bubbleWidth - 12
  );

  const bubbleTop = clamp(
    spotlight.top + spotlight.height + 16,
    12,
    viewportHeight - bubbleHeight - 12
  );

  const robotSize = viewportWidth < 768 ? 120 : 200;
  const robotDirection = stepIndex % 2 === 0 ? "right" : "left";
  let robotLeft = clamp(spotlight.left + spotlight.width - robotSize * 0.2, 12, viewportWidth - robotSize - 12);
  let robotTop = clamp(spotlight.top - robotSize - 18, 12, viewportHeight - robotSize - 12);

  // Adjust robot position per step as requested by UX
  if (rect) {
    if (stepIndex === 0) {
      // step 1: robot to the LEFT of KPI box
      robotLeft = clamp(spotlight.left - robotSize - 12, 150, viewportWidth - robotSize - 12);
      robotTop = clamp(spotlight.top + spotlight.height / 2 - robotSize / 2 + 202, 12, viewportHeight - robotSize - 12);
    } else if (stepIndex === 1) {
      // step 2: robot to the RIGHT of roadmap box
      // move the robot closer to the box (more to the left)
      robotLeft = clamp(spotlight.left + spotlight.width - robotSize - 120, 12, viewportWidth - robotSize - 12);
      robotTop = clamp(spotlight.top + spotlight.height / 2 - robotSize / 2 + 250, 12, viewportHeight - robotSize - 12);
    } else if (stepIndex === 2) {
      // step 3: left of subjects box
      robotLeft = clamp(spotlight.left - robotSize - 12, 152, viewportWidth - robotSize - 12);
      robotTop = clamp(spotlight.top + spotlight.height / 2 - robotSize / 2 + 252, 12, viewportHeight - robotSize - 12);
    } else if (stepIndex === 3) {
      // step 4: centered below tips box
      robotLeft = clamp(spotlight.left + spotlight.width / 2 - robotSize / 2, 12, viewportWidth - robotSize - 12);
      robotTop = clamp(spotlight.top + spotlight.height + 24, 12, viewportHeight - robotSize - 12);
    }
  }

  const tourBubbleTop = stepIndex === 3
    ? clamp(spotlight.top - bubbleHeight + 50, 12, viewportHeight - bubbleHeight - 12)
    : bubbleTop;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute rounded-3xl transition-all duration-300"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.45)",
        }}
      />

      <div
        className="absolute rounded-3xl pointer-events-none"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          boxShadow:
            "0 0 0 2px rgba(45, 212, 191, 0.65), 0 0 40px rgba(6, 182, 212, 0.25)",
        }}
      />

      <div
        className="absolute pointer-events-none transition-all duration-700 ease-out"
        style={{
          top: robotTop,
          left: robotLeft,
          width: robotSize,
          height: robotSize,
          filter: "drop-shadow(0 16px 24px rgba(2, 132, 199, 0.2))",
        }}
      >
        <EduBot3DWithMode
          mode="tour"
          stepIndex={stepIndex}
          pointDirection={robotDirection}
          interactive={false}
        />
      </div>

      <div className="absolute w-[720px] max-w-[96vw]" style={{ top: tourBubbleTop, left: bubbleLeft }}>
        <div className="relative overflow-visible rounded-3xl bg-white/92 backdrop-blur-xl border border-white/50 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-sky-500/10" />

          <div className="relative p-5 sm:p-6">
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
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-base text-slate-700 leading-relaxed">{step.text}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
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
                  {stepIndex === steps.length - 1 ? "¡Entendido!" : "Siguiente"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] text-slate-600">
              Tip: puedes volver a abrir este recorrido con el botón{" "}
              <span className="font-extrabold text-slate-800">“Revisar tutorial”</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Dashboard({ onSubjectSelect, onGeneralSimulator, onStudyPlanSelect }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [courseDetails, setCourseDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingCourseItemKey, setUpdatingCourseItemKey] = useState("");
  const [progressSummary, setProgressSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [recentProgress, setRecentProgress] = useState(null);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError("");
        const data = await getCoursesRequest();
        if (!alive) return;
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!alive) return;
        setCoursesError(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudieron cargar las materias."
        );
        setCourses([]);
      } finally {
        if (alive) setCoursesLoading(false);
      }
    };

    loadCourses();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError("");
        const data = await getProgressSummary();
        if (!alive) return;
        setProgressSummary(data);
      } catch (error) {
        if (!alive) return;
        setSummaryError(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudo cargar el resumen de progreso."
        );
        setProgressSummary(null);
      } finally {
        if (alive) setSummaryLoading(false);
      }
    };

    loadSummary();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRecent = async () => {
      try {
        setRecentLoading(true);
        setRecentError("");
        const data = await getRecentProgress();
        if (!alive) return;
        setRecentProgress(data);
      } catch (error) {
        if (!alive) return;
        setRecentError(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudo cargar la actividad reciente."
        );
        setRecentProgress(null);
      } finally {
        if (alive) setRecentLoading(false);
      }
    };

    loadRecent();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadDetails = async () => {
      if (!courses.length) {
        setCourseDetails({});
        return;
      }

      try {
        setDetailsLoading(true);
        const results = await Promise.allSettled(
          courses.map(async (course) => {
            const [progress, mastery, plan, nextActivity, history] = await Promise.all([
              getCourseProgress(course.id),
              getCourseMastery(course.id),
              getActiveStudyPlan(course.id),
              getNextStudyPlanActivity(course.id),
              getStudyPlanHistory(course.id),
            ]);

            return {
              courseId: course.id,
              progress,
              mastery,
              plan,
              nextActivity,
              history,
            };
          })
        );

        if (!alive) return;

        const nextMap = {};
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.courseId != null) {
            nextMap[result.value.courseId] = result.value;
          }
        });

        setCourseDetails(nextMap);
      } catch {
        if (!alive) return;
        setCourseDetails({});
      } finally {
        if (alive) setDetailsLoading(false);
      }
    };

    loadDetails();
    return () => {
      alive = false;
    };
  }, [courses]);

  const stats = useMemo(() => {
    // Uniform keys: prefer summary when available
    if (progressSummary) {
      return {
        coursesWithActivity: progressSummary.totalCourses ?? 0,
        totalCompletedLessons: progressSummary.totalCompletedLessons ?? 0,
        totalInProgressLessons: progressSummary.totalInProgressLessons ?? 0,
        overallCompletion: Math.round(progressSummary.overallCompletionPercentage ?? 0),
      };
    }

    // Fallback seguros cuando no hay summary
    return {
      coursesWithActivity: courses.length || 0,
      totalCompletedLessons: 0,
      totalInProgressLessons: 0,
      overallCompletion: 0,
    };
  }, [progressSummary, courses]);

  const courseCards = useMemo(() => {
    return courses.map((course) => {
      const detail = courseDetails[course.id] || {};
      const masteryPercent = toSafeNumber(detail.mastery?.masteryPercent, 0);
      const progressPercent = toSafeNumber(
        detail.progress?.completionPercentage,
        masteryPercent
      );
      const history = Array.isArray(detail.history) ? detail.history : [];
      const topics = Array.isArray(detail.mastery?.topics) ? detail.mastery.topics : [];

      return {
        course,
        detail,
        progressPercent,
        masteryPercent,
        history,
        topics,
      };
    });
  }, [courses, courseDetails]);

  const tutorialSteps = useMemo(
    () => [
      {
        title: "Resumen de tu progreso",
        text: "Aquí ves un resumen general: avance promedio, temas dominados, planes activos y tu carga de estudio reciente.",
        anchorId: "kpi-section",
      },
      {
        title: "Historial de actividades",
        text: "Esta sección agrupa tus actividades, la siguiente tarea sugerida y el historial de cambios del plan.",
        anchorId: "roadmap-section",
      },
      {
        title: "Materias de estudio",
        text: "Desde aquí entras a cada materia. Puedes revisar su progreso y continuar con el contenido correspondiente.",
        anchorId: "subjects-section",
      },
      {
        title: "Tips y consejos",
        text: "El robot te acompaña en esta zona con recomendaciones breves para estudiar mejor y usar el simulador.",
        anchorId: "tips-section",
      },
    ],
    []
  );

  const handleOpenCourse = (course) => {
    const target = course?.code || course?.slug || course?.id;
    if (target) onSubjectSelect?.(target);
  };

  const handleOpenTutorial = () => {
    setTourStep(0);
    setTourOpen(true);
  };

  const handleOpenPlanItem = (course, item) => {
    const target = getPlanItemTarget(course, item);
    if (target.path) window.location.assign(target.path);
  };

  const handleTogglePlanItemStatus = async (course, item) => {
    if (!item?.id) return;

    const currentStatus = String(item.status || "pending").toLowerCase();
    const nextStatus = currentStatus === "done" ? "pending" : "done";
    const itemKey = `${course.id}:${item.id}`;

    try {
      setUpdatingCourseItemKey(itemKey);
      await updateStudyPlanItemStatus(item.id, nextStatus);

      const [plan, nextActivity, history] = await Promise.all([
        getActiveStudyPlan(course.id),
        getNextStudyPlanActivity(course.id),
        getStudyPlanHistory(course.id),
      ]);

      setCourseDetails((prev) => ({
        ...prev,
        [course.id]: {
          ...(prev[course.id] || {}),
          plan,
          nextActivity,
          history,
        },
      }));
    } catch (error) {
      console.error("[Dashboard] No se pudo actualizar el item del plan", error);
    } finally {
      setUpdatingCourseItemKey("");
    }
  };

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      setTourOpen(true);
      setTourStep(0);
    }
  }, []);

  useEffect(() => {
    if (!tourOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [tourOpen]);

  useEffect(() => {
    if (!tourOpen) return;

    const anchorId = tutorialSteps[tourStep]?.anchorId;
    const element = anchorId ? document.getElementById(anchorId) : null;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tourOpen, tourStep, tutorialSteps]);

  const closeTour = () => {
    localStorage.setItem(TOUR_KEY, "1");
    setTourOpen(false);
  };

  const nextTour = () => {
    if (tourStep >= tutorialSteps.length - 1) {
      closeTour();
      return;
    }
    setTourStep((current) => current + 1);
  };

  const prevTour = () => {
    setTourStep((current) => Math.max(0, current - 1));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),linear-gradient(180deg,#f8fffe_0%,#eefbff_44%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7.5xl px-7 py-8 sm:px-10 lg:py-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Tu tablero
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Dashboard de preparación
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Revisa tus materias, abre el curso con un clic y continúa la hoja de ruta desde la misma tarjeta.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleOpenTutorial}
              className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50/90 px-4 py-2.5 text-sm font-bold text-cyan-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-100 hover:shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              Revisar tutorial
            </button>
          </div>
        </header>

        <section id="kpi-section" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Cursos con actividad"
            value={String(stats.coursesWithActivity ?? 0)}
            detail="Cursos donde has interactuado"
            Icon={BookOpen}
            accent="from-teal-500 to-cyan-500"
          />
          <KpiCard
            title="Lecciones completadas"
            value={String(stats.totalCompletedLessons ?? 0)}
            detail="Lecciones finalizadas"
            Icon={CheckCircle2}
            accent="from-emerald-500 to-lime-500"
          />
          <KpiCard
            title="Lecciones en progreso"
            value={String(stats.totalInProgressLessons ?? 0)}
            detail="Lecciones activas"
            Icon={Clock}
            accent="from-orange-500 to-amber-500"
          />
          <KpiCard
            title="Progreso global"
            value={`${String(stats.overallCompletion ?? 0)}%`}
            detail="Completitud general"
            Icon={TrendingUp}
            accent="from-violet-500 to-fuchsia-500"
          />
        </section>

        <section id="roadmap-section" className="mt-8 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-xl sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Actividad reciente</p>
              <h2 className="mt-1 text-lg font-black text-slate-900">Lo último que revisaste</h2>
            </div>
            {recentLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : null}
          </div>

          {recentError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {recentError}
            </div>
          ) : null}

          {!recentLoading && !recentError && !recentProgress ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Todavía no hay actividad reciente registrada.
            </p>
          ) : null}

          {recentProgress?.lastLessonActivity ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">Lección</p>
                <h3 className="mt-2 text-base font-black text-slate-900">{recentProgress.lastLessonActivity.lessonTitle}</h3>
                <p className="mt-1 text-sm text-slate-600">{recentProgress.lastLessonActivity.courseTitle}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Última interacción: {formatDate(recentProgress.lastLessonActivity.lastInteraction)}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">Simulador</p>
                <h3 className="mt-2 text-base font-black text-slate-900">
                  {recentProgress.lastExamActivity?.examTitle || "Sin simulador"}
                </h3>
                {recentProgress.lastExamActivity ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Última interacción: {formatDate(recentProgress.lastExamActivity.lastInteraction)}
                  </p>
                ) : null}
              </article>
            </div>
          ) : null}
        </section>

        <section id="subjects-section" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Materias de estudio</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Materias de Estudio</h2>
            </div>
            {detailsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : null}
          </div>

          {coursesLoading ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-[2rem] border border-slate-200 bg-white/80" />
              ))}
            </div>
          ) : coursesError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {coursesError}
            </div>
          ) : courseCards.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
              No hay cursos disponibles todavía.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {courseCards.map(({ course, detail, progressPercent, masteryPercent, history, topics }) => {
                const plan = detail.plan || null;
                const nextActivity = detail.nextActivity || null;
                const planItems = Array.isArray(plan?.items)
                  ? [...plan.items].sort((left, right) => {
                      const leftOrder = toSafeNumber(left?.orderN, 0);
                      const rightOrder = toSafeNumber(right?.orderN, 0);
                      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
                      return toSafeNumber(left?.id, 0) - toSafeNumber(right?.id, 0);
                    })
                  : [];
                const historyItems = Array.isArray(history) ? history : [];
                const topTopics = topics.slice(0, 3);

                return (
                  <article
                    key={course.id}
                    className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="flex h-full flex-col p-5 sm:p-6">
                      <button
                        type="button"
                        onClick={() => handleOpenCourse(course)}
                        className="flex items-start justify-between gap-4 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-6 cursor-pointer">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-md">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                                {course.title}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-slate-500">{course.description}</p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                              <span>{progressPercent}% de progreso</span>
                              <span className="font-extrabold text-slate-900">{masteryPercent}% dominio</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                        </div>
                      </button>
                      <h3 className="mt-3 text-lg font-black text-slate-900">Hoja de ruta</h3>
                      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2">
                              <ListChecks className="h-4 w-4 text-slate-700" />
                              <p className="text-sm font-extrabold text-slate-900">Plan semanal</p>
                            </div>

                            {!plan ? (
                              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                Plan activo no encontrado.
                              </div>
                            ) : planItems.length === 0 ? (
                              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                El plan no tiene actividades.
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2">
                                {planItems.slice(0, 6).map((item) => {
                                  const meta = getPlanItemStatusMeta(item.status);
                                  const itemKey = `${course.id}:${item.id}`;
                                  const isUpdating = updatingCourseItemKey === itemKey;
                                  const typeLabel = getPlanItemTypeLabel(item.type);
                                  const refTypeLabel = getPlanItemTypeLabel(item.contentRefType);
                                  const statusValue = String(item.status || "pending").toLowerCase();
                                  const isPending = statusValue === "pending";

                                  return (
                                    <div
                                      key={item.id}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => handleOpenPlanItem(course, item)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault();
                                          handleOpenPlanItem(course, item);
                                        }
                                      }}
                                      className={[
                                        "w-full rounded-2xl border bg-white px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                                        isPending
                                          ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                                          : "border-slate-200 hover:border-cyan-200",
                                      ].join(" ")}
                                    >
                                      <div className="flex items-start gap-3">
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleTogglePlanItemStatus(course, item);
                                          }}
                                          disabled={isUpdating}
                                          className="mt-0.5 shrink-0 rounded-full p-0.5 text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          aria-label={meta.checked ? "Marcar como pendiente" : "Marcar como realizado"}
                                        >
                                          {meta.checked ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}
                                        </button>

                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                              <p className="text-sm font-black text-slate-900">
                                                {typeLabel} #{item.orderN}
                                              </p>
                                              <p className="mt-1 text-xs text-slate-500">
                                                {refTypeLabel} · Ref {item.contentRefId}
                                              </p>
                                            </div>

                                            <span className={["inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold", meta.badge].join(" ")}>
                                              {meta.label}
                                            </span>
                                          </div>

                                          <div className="mt-3 flex items-center justify-between gap-3">
                                            <p className="text-sm text-slate-600 line-clamp-1">
                                              {item.title || item.description || "Actividad de la hoja de ruta"}
                                            </p>
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleOpenPlanItem(course, item);
                                              }}
                                              className="inline-flex shrink-0 items-center rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-black text-cyan-800 transition hover:bg-cyan-100 cursor-pointer"
                                            >
                                              {getPlanItemActionLabel(item)}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-slate-700" />
                              <p className="text-sm font-extrabold text-slate-900">Siguiente actividad</p>
                            </div>

                            {!nextActivity ? (
                              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                No hay una siguiente actividad disponible.
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenPlanItem(course, nextActivity)}
                                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/40"
                              >
                                <p className="text-sm font-black text-slate-900">
                                  {getPlanItemTypeLabel(nextActivity.type || nextActivity.contentRefType)} #{nextActivity.orderN || nextActivity.contentRefId}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {getPlanItemTypeLabel(nextActivity.contentRefType)} · Ref {nextActivity.contentRefId}
                                </p>
                                <span className={["mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold", getPlanItemStatusMeta(nextActivity.status).badge].join(" ")}>
                                  {getPlanItemStatusMeta(nextActivity.status).label}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-slate-900">
                              <History className="h-4 w-4" />
                              <p className="text-sm font-black">Historial</p>
                            </div>

                            {historyItems.length ? (
                              <div className="mt-3 space-y-2">
                                {historyItems.slice(0, 3).map((item) => (
                                  <div key={item.id} className="rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-800">Versión {item.version ?? item.id}</p>
                                    <p className="text-xs text-slate-500">
                                      {item.itemsCount || 0} actividades · {formatDate(item.createdAt || item.updatedAt || item.date)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-3 text-sm text-slate-600">Sin historial disponible.</p>
                            )}
                          </div>

                          {topTopics.length ? (
                            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
                              <p className="text-sm font-black text-slate-900">Dominio por tema</p>
                              <div className="mt-3 space-y-2">
                                {topTopics.map((topic) => {
                                  const topicPercent = toSafeNumber(topic.masteryPercent, 0);
                                  return (
                                    <div key={topic.topicId} className="rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-slate-800">
                                          {topic.topicName || `Tema ${topic.topicId}`}
                                        </p>
                                        <span className="text-xs font-black text-cyan-700">{topicPercent}%</span>
                                      </div>
                                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                                          style={{ width: `${topicPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* TIPS Y CONSEJOS */}
        <section id="tips-section" className="mt-10">
          <div className="flex items-start gap-15">

            {/* Robot a la izquierda — parte del flujo, no fixed */}
            <div
              className="hidden md:block shrink-0"
              style={{ width: 200, height: 280, marginTop: 32, marginRight: -16 }}
            >
              <EduBot3DWithMode mode="tips" interactive={false} pointDirection="left" />
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
            </div>
          </div>
        </section>

      <DashboardTour
        open={tourOpen}
        stepIndex={tourStep}
        steps={tutorialSteps}
        anchorId={tutorialSteps[tourStep]?.anchorId}
        onClose={closeTour}
        onNext={nextTour}
        onPrev={prevTour}
      />
      </div>
    </div>
  );
}
