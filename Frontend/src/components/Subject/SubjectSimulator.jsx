import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  Copy,
  HelpCircle,
  ListChecks,
  Loader2,
  LockKeyhole,
  Play,
  ShieldAlert,
  Timer,
  X,
} from "lucide-react";

import {
  finishExamAttempt,
  getCourseExams,
  getExamAttemptReview,
  getExamItems,
  submitExamAttemptResponse,
  startExamAttempt,
} from "../../services/assessmentService";

function useSecurityGuards(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const block = (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    const onKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "v", "x", "p", "s", "u"].includes(key)) {
        block(event);
      }
      if (event.key === "PrintScreen") {
        block(event);
      }
    };

    const listeners = [
      ["copy", block],
      ["cut", block],
      ["paste", block],
      ["contextmenu", block],
      ["selectstart", block],
      ["dragstart", block],
      ["keydown", onKeyDown],
    ];

    listeners.forEach(([name, handler]) => document.addEventListener(name, handler, true));

    return () => {
      listeners.forEach(([name, handler]) => document.removeEventListener(name, handler, true));
    };
  }, [enabled]);
}

function Stat({ value, label, tone }) {
  return (
    <div className={["rounded-3xl border px-5 py-4", tone].join(" ")}>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}

function getExamQuestionCount(exam) {
  return Number(exam?.itemCount || exam?.itemsCount || exam?.questionCount || 0);
}

function isMultiChoiceItem(item) {
  return String(item?.type || "").toLowerCase() === "multi_choice";
}

function normalizeStoredAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.map((value) => String(value));
  }

  if (typeof answer === "string") {
    const trimmed = answer.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((value) => String(value));
        }
      } catch {
        // fallback below
      }
    }

    if (trimmed.includes(",")) {
      return trimmed.split(",").map((value) => value.trim()).filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

function formatAnswerLabels(answer, options) {
  const values = normalizeStoredAnswer(answer);
  if (!values.length) return "Sin respuesta";

  const optionMap = new Map((Array.isArray(options) ? options : []).map((option) => [String(option.id), option.text]));
  return values.map((value) => optionMap.get(String(value)) || String(value)).join(", ");
}

function isDurationGeneratedColumnError(error) {
  const message = String(
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    ""
  ).toLowerCase();

  return message.includes("duration_sec") && message.includes("generated column");
}

export default function SubjectSimulator({ course, slug, variant = "preview", onClose, onProgressUpdated }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examError, setExamError] = useState("");
  const [selectedExamId, setSelectedExamId] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("examId");
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  });

  const [attempt, setAttempt] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const [examSession, setExamSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [windowBootstrapped, setWindowBootstrapped] = useState(false);

  useSecurityGuards(variant === "window" && started);

  useEffect(() => {
    let alive = true;

    const loadExams = async () => {
      if (!course?.id) {
        setExams([]);
        setSelectedExamId(null);
        return;
      }

      try {
        setLoadingExams(true);
        setExamError("");
        const data = await getCourseExams(course.id);
        if (!alive) return;

        const list = Array.isArray(data) ? data : [];
        setExams(list);
        setSelectedExamId((current) => current ?? list[0]?.id ?? null);
      } catch (error) {
        if (!alive) return;
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudieron cargar los simulacros del curso.";
        setExamError(msg);
        setExams([]);
        setSelectedExamId(null);
      } finally {
        if (!alive) return;
        setLoadingExams(false);
      }
    };

    loadExams();

    return () => {
      alive = false;
    };
  }, [course?.id]);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId) ?? exams[0] ?? null,
    [exams, selectedExamId]
  );

  const totalQuestions = useMemo(() => {
    if (questions.length) return questions.length;
    return Number(selectedExam?.itemCount || selectedExam?.itemsCount || selectedExam?.questionCount || 0);
  }, [questions.length, selectedExam?.itemCount, selectedExam?.itemsCount, selectedExam?.questionCount]);

  const currentItem = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);
  const currentItemIsMultiChoice = useMemo(() => isMultiChoiceItem(currentItem), [currentItem]);

  const reviewResponses = useMemo(() => {
    return Array.isArray(attemptDetail?.responses) ? attemptDetail.responses : [];
  }, [attemptDetail?.responses]);

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((submittedCount / totalQuestions) * 100);
  }, [submittedCount, totalQuestions]);

  const questionSlots = useMemo(
    () => Array.from({ length: Math.max(0, totalQuestions) }, (_, index) => index),
    [totalQuestions]
  );

  useEffect(() => {
    if (started) return;
    const seconds = Math.max(60, Number(selectedExam?.timeLimitSec || 10 * 60));
    setTimeLeft(seconds);
  }, [selectedExam?.timeLimitSec, started]);

  useEffect(() => {
    if (variant !== "window" || !started) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, variant]);

  useEffect(() => {
    if (!started || actionLoading) return;
    if (timeLeft !== 0) return;

    finishAttemptAndSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, started, actionLoading]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  const minutesLabel = useMemo(() => {
    const totalSeconds = Math.max(60, Number(selectedExam?.timeLimitSec || 10 * 60));
    return Math.round(totalSeconds / 60);
  }, [selectedExam?.timeLimitSec]);

  const startAttemptAndSession = async () => {
    if (!selectedExam?.id) return;

    try {
      setActionLoading(true);
      setActionError("");
      setFinished(false);
      setSubmittedCount(0);
      setCurrentIndex(0);
      setSelectedOption(null);
      setSelectedOptions([]);

      const createdAttempt = await startExamAttempt(selectedExam.id);
      setAttempt(createdAttempt);

      const examData = await getExamItems(selectedExam.id);
      const parsedItems = Array.isArray(examData?.items) ? examData.items : [];

      setExamSession(examData || null);
      setQuestions(parsedItems);

      const seconds = Math.max(
        60,
        Number(examData?.timeLimitSec || selectedExam?.timeLimitSec || 10 * 60)
      );
      setTimeLeft(seconds);

      setStarted(true);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo iniciar el intento del simulacro.";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const finishAttemptAndSession = async () => {
    if (!attempt?.id) return;

    try {
      setActionLoading(true);
      setActionError("");

      const finishedAttempt = await finishExamAttempt(attempt.id);
      const detail = await getExamAttemptReview(attempt.id);

      setAttempt(finishedAttempt || attempt);
      setAttemptDetail(detail || finishedAttempt || attempt);
      setStarted(false);
      setFinished(true);
      onProgressUpdated?.();
    } catch (error) {
      if (isDurationGeneratedColumnError(error)) {
        let detail = null;
        try {
          detail = await getExamAttemptReview(attempt.id);
        } catch {
          detail = null;
        }

        setAttempt((prev) =>
          prev
            ? {
              ...prev,
              completedAt: new Date().toISOString(),
            }
            : prev
        );
        setAttemptDetail(detail || attemptDetail || attempt);
        setStarted(false);
        setFinished(true);
        setActionError("");
        onProgressUpdated?.();
        return;
      }

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo finalizar el intento.";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openSecureWindow = () => {
    const basePath = slug ? `/app/subject/${slug}/simulator` : "/app/general-simulator";
    const params = new URLSearchParams();
    if (selectedExam?.id) {
      params.set("examId", String(selectedExam.id));
    }
    const path = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    const popup = window.open(path, "_blank", "noopener,noreferrer,width=1280,height=900");
    if (popup) popup.focus();
  };

  const submitAndGoNext = async () => {
    if (!attempt?.id || !currentItem?.id) return;
    const answerPayload = currentItemIsMultiChoice ? selectedOptions : selectedOption;
    if (currentItemIsMultiChoice ? selectedOptions.length === 0 : selectedOption == null) return;

    try {
      setSubmittingAnswer(true);
      setActionError("");

      await submitExamAttemptResponse(attempt.id, {
        itemId: currentItem.id,
        answer: answerPayload,
        timeSpentSec: 0,
        hintsUsed: 0,
      });

      const isLast = currentIndex >= questions.length - 1;
      const newCount = Math.min(submittedCount + 1, questions.length || submittedCount + 1);
      setSubmittedCount(newCount);
      setSelectedOption(null);
      setSelectedOptions([]);

      if (isLast) {
        await finishAttemptAndSession();
        return;
      }

      setCurrentIndex((value) => value + 1);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo registrar la respuesta.";
      setActionError(msg);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  useEffect(() => {
    if (variant !== "window") return;
    if (!selectedExam?.id || loadingExams || actionLoading || started || attempt?.id || windowBootstrapped) {
      return;
    }

    setWindowBootstrapped(true);
    startAttemptAndSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, selectedExam?.id, loadingExams, actionLoading, started, attempt?.id, windowBootstrapped]);

  if (variant === "preview") {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="relative bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-sky-500/15 px-6 py-6">
          <div className="absolute inset-0 pointer-events-none opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.22),transparent_36%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.18),transparent_38%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.16),transparent_40%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                <Clock3 size={13} /> Simulador
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">Simulador de examen</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Se abrirá una ventana dedicada para la práctica. Ahí se bloquearán accesos básicos del navegador dentro de lo posible.
              </p>
            </div>

            <button
              type="button"
              disabled={!selectedExam?.id || loadingExams}
              onClick={openSecureWindow}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play size={18} /> Iniciar simulador
            </button>
          </div>
        </div>

        <div className="px-6 pt-5">
          {loadingExams ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Loader2 size={16} className="animate-spin" /> Cargando simulacros...
            </p>
          ) : examError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {examError}
            </p>
          ) : exams.length ? (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Simuladores disponibles ({exams.length})
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {exams.map((exam) => {
                  const isActive = exam.id === selectedExam?.id;
                  const minutes = Math.round(Math.max(60, Number(exam?.timeLimitSec || 600)) / 60);
                  const questionCount = getExamQuestionCount(exam);

                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => setSelectedExamId(exam.id)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left transition",
                        isActive
                          ? "border-cyan-300 bg-cyan-50 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <p className="text-sm font-black text-slate-900">{exam.title || "Simulador"}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Modo {exam.mode || "diagnóstico"} · {minutes} min
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              Este curso no tiene simulacros activos todavía.
            </p>
          )}
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          {/* <Stat
            value={selectedExam ? getExamQuestionCount(selectedExam) || "--" : "--"}
            label="Preguntas"
            tone="border-sky-100 bg-sky-50/70"
          /> */}
          <Stat value={minutesLabel} label="Minutos" tone="border-teal-100 bg-teal-50/70" />
          <Stat value="60%" label="Mín. aprobatorio" tone="border-cyan-100 bg-cyan-50/70" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen select-none bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.18),transparent_36%),linear-gradient(180deg,#f8fffe_0%,#eefbff_42%,#f8fafc_100%)] text-slate-900"
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onPaste={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="mx-auto flex min-h-screen max-w-8xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/70 px-5 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700">Ventana segura</p>
            <h1 className="mt-1 text-lg font-black text-slate-900">{course?.title || "Simulador de examen"}</h1>
          </div>

          <button
            type="button"
            onClick={onClose || (() => window.close())}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <X size={16} /> Cerrar
          </button>
        </div>

        <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl backdrop-blur">
            <div className="border-b border-slate-100 px-6 py-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-700">
                  <ShieldAlert size={13} /> Interacción restringida
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700">
                  <LockKeyhole size={13} /> Sin copiar ni pegar
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Simulador de examen</h2>
              {/* <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Esta ventana bloquea selección, menú contextual, copiar, pegar y atajos habituales del navegador mientras la simulación está activa. La captura de pantalla del sistema operativo no se puede impedir desde la web.
              </p> */}

              {/* <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Simulacro en ejecución</p>
                {loadingExams ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Loader2 size={16} className="animate-spin" /> Preparando simulador...
                  </p>
                ) : selectedExam ? (
                  <>
                    <p className="mt-1 text-base font-black text-slate-900">{examSession?.title || selectedExam.title}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Modo {examSession?.mode || selectedExam.mode || "diagnostic"} · {Math.round(Math.max(60, Number(examSession?.timeLimitSec || selectedExam?.timeLimitSec || 600)) / 60)} minutos
                    </p>
                  </>
                ) : (
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                    No hay simulacros activos para este curso.
                  </p>
                )}
              </div> */}
            </div>

            {/* <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
              <Stat value={totalQuestions || "--"} label="Preguntas" tone="border-sky-100 bg-sky-50/70" />
              <Stat value={submittedCount} label="Respondidas" tone="border-teal-100 bg-teal-50/70" />
              <Stat value={Math.max(0, totalQuestions - submittedCount)} label="Restantes" tone="border-cyan-100 bg-cyan-50/70" />
            </div> */}

            <div className="px-6 pb-6">
              {started && currentItem ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                      <HelpCircle size={14} /> Pregunta {currentIndex + 1} de {Math.max(1, totalQuestions)}
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                      {currentItemIsMultiChoice ? "Selección múltiple" : "Selección única"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-black leading-tight text-slate-900">{currentItem.stem || "Pregunta sin enunciado"}</h3>

                  <div className="mt-5 grid gap-3">
                    {(Array.isArray(currentItem.options) ? currentItem.options : []).map((option) => {
                      const active = currentItemIsMultiChoice
                        ? selectedOptions.includes(String(option.id))
                        : String(selectedOption) === String(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            if (currentItemIsMultiChoice) {
                              setSelectedOptions((current) => (
                                current.includes(String(option.id))
                                  ? current.filter((value) => value !== String(option.id))
                                  : [...current, String(option.id)]
                              ));
                              return;
                            }

                            setSelectedOption(String(option.id));
                          }}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <p className="text-sm font-semibold">{option.text}</p>
                        </button>
                      );
                    })}
                  </div>

                  {actionError ? (
                    <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                      {actionError}
                    </p>
                  ) : null}

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={submitAndGoNext}
                      disabled={submittingAnswer || actionLoading || (currentItemIsMultiChoice ? selectedOptions.length === 0 : selectedOption == null)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {(submittingAnswer || actionLoading) ? <Loader2 size={16} className="animate-spin" /> : null}
                      {currentIndex >= questions.length - 1 ? "Finalizar simulador" : "Siguiente"}
                    </button>
                  </div>
                </div>
              ) : actionLoading || loadingExams ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Loader2 size={16} className="animate-spin" /> Preparando preguntas del simulador...
                  </p>
                </div>
              ) : finished ? (
                <div className="space-y-5">
                  <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Simulación completada</p>
                    <p className="mt-2 text-2xl font-black text-emerald-900">
                      Puntaje: {attemptDetail?.scoreNorm ?? attempt?.scoreNorm ?? 0}%
                    </p>
                    <p className="mt-2 text-sm text-emerald-800">
                      Correctas: {attemptDetail?.correctAnswers ?? attemptDetail?.metadata?.correctAnswers ?? 0} de {attemptDetail?.metadata?.totalItems ?? totalQuestions}
                    </p>
                    <p className="mt-1 text-sm text-emerald-800">
                      Puedes cerrar esta ventana para volver al curso.
                    </p>
                  </div>

                  {attemptDetail ? (
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Revisión del intento</p>
                          <h3 className="mt-1 text-xl font-black text-slate-900">Detalle de respuestas</h3>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>Inicio: {attemptDetail.startedAt ? new Date(attemptDetail.startedAt).toLocaleString("es-EC") : "-"}</p>
                          <p>Cierre: {attemptDetail.completedAt ? new Date(attemptDetail.completedAt).toLocaleString("es-EC") : "-"}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <Stat value={attemptDetail?.metadata?.answeredItems ?? reviewResponses.length ?? 0} label="Respondidas" tone="border-sky-100 bg-sky-50/70" />
                        <Stat value={attemptDetail?.correctAnswers ?? attemptDetail?.metadata?.correctAnswers ?? 0} label="Correctas" tone="border-emerald-100 bg-emerald-50/70" />
                        <Stat value={attemptDetail?.accuracy != null ? `${Math.round(Number(attemptDetail.accuracy) * 100)}%` : attemptDetail?.metadata?.accuracy != null ? `${Math.round(Number(attemptDetail.metadata.accuracy) * 100)}%` : "-"} label="Precisión" tone="border-cyan-100 bg-cyan-50/70" />
                      </div>

                      <div className="mt-5 space-y-3">
                        {reviewResponses.map((response, index) => {
                          const options = Array.isArray(response.options) ? response.options : [];
                          const isMulti = options.length > 0;
                          return (
                            <div key={response.itemId || index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                                    Pregunta {index + 1} · {response.topicId ? `Tema ${response.topicId}` : "Revisión"}
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-900">{response.stem}</p>
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700">
                                      {isMulti ? "Opción múltiple" : "Respuesta abierta"}
                                    </span>
                                  </div>
                                </div>
                                <span className={response?.isCorrect ? "rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-700" : "rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-[11px] font-black text-rose-700"}>
                                  {response ? (response.isCorrect ? "Correcta" : "Incorrecta") : "Sin respuesta"}
                                </span>
                              </div>
                              <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                                <div>
                                  <p className="font-semibold">Tu respuesta</p>
                                  <p>{response ? formatAnswerLabels(response.studentAnswer, options) : "Sin respuesta"}</p>
                                </div>
                                <div>
                                  <p className="font-semibold">Respuesta correcta</p>
                                  <p>{response ? formatAnswerLabels(response.correctAnswer, options) : "-"}</p>
                                </div>
                              </div>
                              {response?.explanation ? (
                                <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm text-slate-700">
                                  <p className="font-semibold">Explicación</p>
                                  <p className="mt-1">{response.explanation}</p>
                                </div>
                              ) : null}
                              <p className="mt-2 text-xs text-slate-500">
                                Puntaje otorgado: {response.awardedScore ?? 0}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : !selectedExam ? (
                <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-center">
                  <p className="text-sm font-semibold text-amber-800">
                    Este curso no tiene simulacros disponibles.
                  </p>
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Listo para comenzar</p>
                  <p className="mt-3 text-lg font-semibold text-slate-700">
                    Se está preparando automáticamente el simulador.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Panel de control</h3>

            <div className="rounded-3xl border border-sky-100 bg-sky-50/70 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Tiempo restante</p>
              <p className="mt-1 inline-flex items-center gap-2 text-4xl font-black text-slate-900">
                <Timer size={28} className="text-sky-600" /> {timeLabel}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600">El intento termina automáticamente cuando el tiempo llega a cero.</p>
            </div>
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Preguntas</p>
              <p className="mt-1 text-xs text-slate-600">Visualiza cuáles ya completaste y en cuál vas.</p>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 mt-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-3 max-h-52 overflow-auto">
                <div className="grid grid-cols-5 gap-2">
                  {questionSlots.length ? (
                    questionSlots.map((index) => {
                      const isCompleted = index < submittedCount;
                      const isCurrent = started && !finished && index === currentIndex;
                      const statusLabel = isCompleted ? "Ok" : isCurrent ? "Actual" : "Pend";

                      return (
                        <div
                          key={index}
                          className={[
                            "rounded-xl border px-2 py-2 text-center text-xs font-black",
                            isCompleted
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : isCurrent
                                ? "border-cyan-300 bg-cyan-100 text-cyan-800"
                                : "border-slate-200 bg-white text-slate-500",
                          ].join(" ")}
                          title={`Pregunta ${index + 1}`}
                        >
                          <p>{index + 1}</p>
                          <p className="mt-1 text-[10px] leading-none">{statusLabel}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="col-span-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-500">
                      Sin preguntas cargadas.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><Copy size={16} className="text-teal-600" /> Copiar y pegar deshabilitados</div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><ShieldAlert size={16} className="text-sky-600" /> Menú contextual deshabilitado</div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><LockKeyhole size={16} className="text-cyan-600" /> Selección de texto deshabilitada</div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-sky-500/15 p-5">
              <p className="text-sm font-bold text-slate-900">Consejo</p>
              <p className="mt-2 text-sm text-slate-600">
                Debes responder en orden. No hay navegación libre entre preguntas para mantener la simulación real.
              </p>
            </div>

            {actionError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {actionError}
              </p>
            ) : null}

            {!selectedExam && !loadingExams ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle size={15} /> No existe un examen disponible para iniciar.
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
