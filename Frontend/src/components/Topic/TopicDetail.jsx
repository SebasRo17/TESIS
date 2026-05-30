import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Clock3, Lock, PlayCircle, Sparkles } from "lucide-react";

import { getCourseTopicsTree } from "../../services/topicsService";
import { getLessonsByTopic, getLessonById, getLessonPrereqs } from "../../services/lessonsService";
import {
  getContentPrereqsByLesson,
  getContentVariant,
  getLessonContent,
  recordContentEvent,
} from "../../services/contentService";
import {
  getLessonProgress,
  startLessonProgress,
  updateLessonProgress,
  completeLessonProgress,
} from "../../services/progressService";
import { getApplicableStudyRules, getTopicStudyRules } from "../../services/studyRulesService";

function indexTopicTree(nodes) {
  const byId = new Map();
  const parentById = new Map();

  const walk = (items = [], parent = null) => {
    for (const item of items) {
      byId.set(item.id, item);

      if (parent) {
        parentById.set(item.id, parent);
      }

      if (item.children?.length) walk(item.children, item);
    }
  };

  walk(nodes);
  return { byId, parentById };
}

function parseMaterialIndex(lastPosition) {
  const match = String(lastPosition || "").match(/^material:(\d+)/i);
  return match ? Number(match[1]) : null;
}

function formatMinutes(minutes) {
  if (minutes == null) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} h ${remaining} min` : `${hours} h`;
}

function getModalidadLabel(value) {
  const key = String(value || "").toLowerCase();
  if (key === "video") return "Video";
  if (key === "practice") return "Práctica";
  if (key === "text") return "Lectura";
  if (key === "quiz") return "Cuestionario";
  return value ? String(value) : "Recurso";
}

function getDificultadLabel(value) {
  const key = String(value || "").toLowerCase();
  if (key === "beginner") return "Inicial";
  if (key === "intermediate") return "Intermedio";
  if (key === "advanced") return "Avanzado";
  return value ? String(value) : "";
}

export default function TopicDetail({ topic, onBack, initialLessonId = null }) {
  const courseId = topic?.courseId;
  const contentViewportRef = useRef(null);

  const [topicTree, setTopicTree] = useState([]);
  const [loadingTree, setLoadingTree] = useState(false);

  const [selectedTopicId, setSelectedTopicId] = useState(topic?.id || null);
  const [topicLessons, setTopicLessons] = useState([]);
  const [loadingTopicLessons, setLoadingTopicLessons] = useState(false);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [lessonPrereqs, setLessonPrereqs] = useState([]);
  const [lessonContent, setLessonContent] = useState([]);
  const [contentPrereqs, setContentPrereqs] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState("");
  const [lessonProgress, setLessonProgress] = useState(null);
  const [loadingLessonProgress, setLoadingLessonProgress] = useState(false);
  const [selectedContentIndex, setSelectedContentIndex] = useState(null);
  const [maxUnlockedMaterialIndex, setMaxUnlockedMaterialIndex] = useState(0);
  const [canAdvanceMaterial, setCanAdvanceMaterial] = useState(false);
  const [preferredLessonId, setPreferredLessonId] = useState(initialLessonId);
  const [studyRules, setStudyRules] = useState([]);
  const [loadingStudyRules, setLoadingStudyRules] = useState(false);
  const [studyRulesError, setStudyRulesError] = useState("");

  useEffect(() => {
    setSelectedTopicId(topic?.id || null);
    setPreferredLessonId(initialLessonId);
    setSelectedLesson(null);
    setSelectedVariant(null);
    setVariantError("");
    setLessonProgress(null);
    setSelectedContentIndex(null);
    setMaxUnlockedMaterialIndex(0);
    setCanAdvanceMaterial(false);
  }, [topic?.id, initialLessonId]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!courseId) {
        setTopicTree([]);
        setLoadingTree(false);
        return;
      }

      try {
        setLoadingTree(true);
        const data = await getCourseTopicsTree(courseId);
        if (!alive) return;
        setTopicTree(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!alive) return;
        setTopicTree([]);
      } finally {
        if (!alive) return;
        setLoadingTree(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [courseId]);

  useEffect(() => {
    let alive = true;

    const loadLessons = async () => {
      if (!selectedTopicId) {
        setTopicLessons([]);
        setSelectedLesson(null);
        return;
      }

      try {
        setLoadingTopicLessons(true);
        const data = await getLessonsByTopic(selectedTopicId);
        if (!alive) return;

        const normalized = Array.isArray(data) ? data : [];
        setTopicLessons(normalized);
        setSelectedLesson((current) => {
          if (preferredLessonId) {
            const preferred = normalized.find((lesson) => Number(lesson.id) === Number(preferredLessonId));
            if (preferred) {
              setPreferredLessonId(null);
              return preferred;
            }
          }
          if (current && normalized.some((lesson) => lesson.id === current.id)) return current;
          return normalized[0] ?? null;
        });
      } catch (error) {
        if (!alive) return;
        setTopicLessons([]);
        setSelectedLesson(null);
      } finally {
        if (!alive) return;
        setLoadingTopicLessons(false);
      }
    };

    loadLessons();

    return () => {
      alive = false;
    };
  }, [selectedTopicId, preferredLessonId]);

  useEffect(() => {
    let alive = true;

    const loadDetail = async () => {
      if (!selectedLesson?.id) {
        setLessonDetail(null);
        setLessonPrereqs([]);
        setLessonContent([]);
        setContentPrereqs([]);
        setSelectedVariant(null);
        setVariantError("");
        return;
      }

      try {
        setLoadingDetail(true);

        const [detail, prereqs, content, contentReqs] = await Promise.all([
          getLessonById(selectedLesson.id),
          getLessonPrereqs(selectedLesson.id),
          getLessonContent(selectedLesson.id),
          getContentPrereqsByLesson(selectedLesson.id),
        ]);

        if (!alive) return;
        setLessonDetail(detail);
        setLessonPrereqs(Array.isArray(prereqs) ? prereqs : []);
        setLessonContent(Array.isArray(content) ? content : []);
        setContentPrereqs(Array.isArray(contentReqs) ? contentReqs : []);
      } catch (error) {
        if (!alive) return;
        setLessonDetail(null);
        setLessonPrereqs([]);
        setLessonContent([]);
        setContentPrereqs([]);
      } finally {
        if (!alive) return;
        setLoadingDetail(false);
      }
    };

    loadDetail();

    return () => {
      alive = false;
    };
  }, [selectedLesson?.id]);

  useEffect(() => {
    let alive = true;

    const loadLessonProgress = async () => {
      if (!selectedLesson?.id) {
        setLessonProgress(null);
        setLoadingLessonProgress(false);
        return;
      }

      try {
        setLoadingLessonProgress(true);
        const data = await getLessonProgress(selectedLesson.id);
        if (!alive) return;
        setLessonProgress(data || null);
      } catch (error) {
        if (!alive) return;
        setLessonProgress(null);
      } finally {
        if (!alive) return;
        setLoadingLessonProgress(false);
      }
    };

    loadLessonProgress();

    return () => {
      alive = false;
    };
  }, [selectedLesson?.id]);

  useEffect(() => {
    const progressIndex = parseMaterialIndex(lessonProgress?.lastPosition);

    if (lessonProgress?.status === "completed") {
      setMaxUnlockedMaterialIndex(Math.max(lessonContent.length - 1, 0));
      return;
    }

    if (progressIndex != null) {
      setMaxUnlockedMaterialIndex(
        Math.max(0, Math.min(progressIndex + 1, Math.max(lessonContent.length - 1, 0)))
      );
      return;
    }

    setMaxUnlockedMaterialIndex(0);
  }, [lessonProgress?.lastPosition, lessonProgress?.status, lessonContent.length]);

  useEffect(() => {
    setSelectedVariant(null);
    setSelectedContentIndex(null);
    setVariantError("");
    setCanAdvanceMaterial(false);
  }, [selectedLesson?.id]);

  useEffect(() => {
    const node = contentViewportRef.current;
    if (!node || !selectedVariant?.payload?.bodyHtml) {
      setCanAdvanceMaterial(true);
      return;
    }

    const updateAdvanceState = () => {
      const canScroll = node.scrollHeight > node.clientHeight + 4;
      if (!canScroll) {
        setCanAdvanceMaterial(true);
        return;
      }

      const reachedEnd = node.scrollTop + node.clientHeight >= node.scrollHeight - 10;
      setCanAdvanceMaterial(reachedEnd);
    };

    updateAdvanceState();
    node.addEventListener("scroll", updateAdvanceState);
    window.addEventListener("resize", updateAdvanceState);

    return () => {
      node.removeEventListener("scroll", updateAdvanceState);
      window.removeEventListener("resize", updateAdvanceState);
    };
  }, [selectedVariant?.id, selectedVariant?.payload?.bodyHtml, selectedContentIndex]);

  useEffect(() => {
    let alive = true;

    const loadStudyRules = async () => {
      if (!selectedTopicId && !courseId) {
        setStudyRules([]);
        setStudyRulesError("");
        return;
      }

      try {
        setLoadingStudyRules(true);
        setStudyRulesError("");

        const applicable = await getApplicableStudyRules({
          courseId,
          topicId: selectedTopicId,
        });

        if (!alive) return;

        if (Array.isArray(applicable) && applicable.length) {
          setStudyRules(applicable);
          return;
        }

        if (selectedTopicId) {
          const topicRules = await getTopicStudyRules(selectedTopicId);
          if (!alive) return;
          setStudyRules(Array.isArray(topicRules) ? topicRules : []);
          return;
        }

        setStudyRules([]);
      } catch (error) {
        if (!alive) return;
        setStudyRules([]);
        setStudyRulesError(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudieron cargar las reglas de estudio."
        );
      } finally {
        if (!alive) return;
        setLoadingStudyRules(false);
      }
    };

    loadStudyRules();

    return () => {
      alive = false;
    };
  }, [courseId, selectedTopicId]);

  const { byId: topicsById, parentById: topicParents } = useMemo(
    () => indexTopicTree(topicTree),
    [topicTree]
  );
  const initialTopic = topic?._raw || topic;
  const currentTopic = topicsById.get(selectedTopicId) || initialTopic;
  const parentTopic = topicParents.get(selectedTopicId) || null;
  const visibleSubtopics = useMemo(() => {
    if (currentTopic?.children?.length) return currentTopic.children;
    if (parentTopic?.children?.length) return parentTopic.children;
    return [];
  }, [currentTopic, parentTopic]);

  const handleBackToParentTopic = () => {
    if (!parentTopic?.id) return;
    setSelectedTopicId(parentTopic.id);
    setSelectedLesson(null);
    setSelectedVariant(null);
    setVariantError("");
    setLessonProgress(null);
    setSelectedContentIndex(null);
    setMaxUnlockedMaterialIndex(0);
    setCanAdvanceMaterial(false);
  };

  const handleSelectSubtopic = (subtopic) => {
    setSelectedTopicId(subtopic.id);
    setSelectedLesson(null);
    setSelectedVariant(null);
    setVariantError("");
    setLessonProgress(null);
    setSelectedContentIndex(null);
    setMaxUnlockedMaterialIndex(0);
    setCanAdvanceMaterial(false);
  };

  const handleOpenContent = async (content, contentIndex = -1, allowLocked = false) => {
    const variantId = content?.id ?? content?.variantId;
    if (!variantId) return;

    const currentStatus = String(lessonProgress?.status || "").toLowerCase();
    const contentLabel = content?.title || content?.modality || `Material ${contentIndex + 1}`;

    if (!allowLocked && currentStatus !== "completed" && contentIndex > maxUnlockedMaterialIndex) {
      setVariantError("Termina el material actual antes de abrir el siguiente.");
      return;
    }

    try {
      setVariantLoading(true);
      setVariantError("");

      if (selectedLesson?.id && currentStatus !== "completed" && contentIndex === 0 && !lessonProgress) {
        const progressRecord = await startLessonProgress(selectedLesson.id);
        if (progressRecord) setLessonProgress(progressRecord);
      }

      const variant = await getContentVariant(variantId);
      setSelectedContentIndex(contentIndex);
      setSelectedVariant(variant || content);

      await recordContentEvent(variantId, {
        eventType: "open",
        source: "topic-detail",
        lessonId: selectedLesson?.id ?? null,
        modality: content?.modality || null,
        occurredAt: new Date().toISOString(),
      });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo abrir el material seleccionado.";
      setVariantError(msg);
    } finally {
      setVariantLoading(false);
    }
  };

  const handleAdvanceMaterial = async () => {
    if (selectedContentIndex == null || !selectedLesson?.id) return;

    const currentContent = lessonContent[selectedContentIndex];
    if (!currentContent) return;

    if (!canAdvanceMaterial && selectedVariant?.payload?.bodyHtml) {
      setVariantError("Desliza hasta el final del material para continuar.");
      return;
    }

    const currentStatus = String(lessonProgress?.status || "").toLowerCase();
    const contentLabel = currentContent?.title || currentContent?.modality || `Material ${selectedContentIndex + 1}`;
    const isLast = selectedContentIndex >= lessonContent.length - 1;

    try {
      setVariantLoading(true);
      setVariantError("");

      if (currentStatus !== "completed") {
        const updated = await updateLessonProgress(selectedLesson.id, {
          lastPosition: `material:${selectedContentIndex}:${contentLabel}`,
        });

        if (updated) {
          setLessonProgress(updated);
        }
      }

      if (isLast) {
        const completed = await completeLessonProgress(selectedLesson.id);
        if (completed) {
          setLessonProgress(completed);
        }
        return;
      }

      const nextIndex = selectedContentIndex + 1;
      setMaxUnlockedMaterialIndex((prev) => Math.max(prev, nextIndex));
      await handleOpenContent(lessonContent[nextIndex], nextIndex, true);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo actualizar el progreso de la lección.";
      setVariantError(msg);
    } finally {
      setVariantLoading(false);
    }
  };

  if (!topic) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.12),transparent_34%),linear-gradient(180deg,#f8fffe_0%,#eefbff_46%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7.5xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={18} /> Volver a Temas
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-xl backdrop-blur">
          <div className="relative bg-gradient-to-br from-teal-500/90 via-cyan-500/80 to-sky-600/90 px-6 py-6 text-white">
            <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_82%_30%,rgba(255,255,255,0.14),transparent_42%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.10),transparent_42%)]" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 shadow-lg backdrop-blur">
                  <BookOpen size={28} />
                </div>
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em]">
                    <Sparkles size={13} /> Tema en estudio
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{currentTopic?.name || topic.title}</h1>
                  <p className="mt-2 max-w-3xl text-white/85">{currentTopic?.description || topic.desc}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white/90 px-4 py-3 text-slate-900 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Lecciones</p>
                <p className="mt-1 text-2xl font-black">{topicLessons.length}</p>
              </div>
            </div>
          </div>

          <main className="bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,252,255,0.92))] p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Tema actual</p>
                      <h3 className="mt-1 text-lg font-black text-slate-900">{currentTopic?.name || topic.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{currentTopic?.description || "Sin descripción"}</p>
                    </div>
                  </div>

                  {loadingTree ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Cargando subtemas...
                    </div>
                  ) : visibleSubtopics.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Subtemas</p>
                      <div className="space-y-2">
                        {visibleSubtopics.map((child) => {
                          const active = selectedTopicId === child.id;

                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleSelectSubtopic(child)}
                              className={[
                                "w-full rounded-2xl border px-3 py-2 text-left transition",
                                active
                                  ? "border-sky-300 bg-sky-50 shadow-sm"
                                  : "border-cyan-200 bg-cyan-50/60 hover:bg-cyan-50",
                              ].join(" ")}
                            >
                              <p className="text-sm font-bold text-slate-900">{child.name}</p>
                              <p className="text-xs text-slate-600 line-clamp-1">{child.description || "Sin descripción"}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Lecciones</p>
                      <h3 className="mt-1 text-lg font-black text-slate-900">{currentTopic?.name || topic.title}</h3>
                    </div>
                    {parentTopic?.id ? (
                      <button
                        type="button"
                        onClick={handleBackToParentTopic}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Ver tema principal
                      </button>
                    ) : null}
                    {loadingTopicLessons ? (
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500"><Clock3 className="animate-spin" size={14} /> Cargando</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{topicLessons.length} lecciones</span>
                    )}
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto p-3">
                  {loadingTopicLessons ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Cargando lecciones...</div>
                  ) : topicLessons.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No hay lecciones para este tema.</div>
                  ) : (
                    <div className="space-y-3">
                      {topicLessons.map((lesson) => {
                        const active = selectedLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setSelectedLesson(lesson)}
                            className={[
                              "w-full rounded-2xl border px-4 py-4 text-left transition",
                              active
                                ? "border-sky-200 bg-sky-50/70 shadow-sm"
                                : "border-slate-200 bg-white hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div className={[
                                "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                                active ? "bg-sky-600 text-white" : "bg-sky-500/10 text-sky-700",
                              ].join(" ")}>
                                <PlayCircle size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-slate-900 line-clamp-1">{lesson.title}</p>
                                <p className="mt-1 text-xs text-slate-500">Lección #{lesson.id}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                {!selectedLesson ? (
                  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <BookOpen size={44} className="mx-auto text-slate-300" />
                    <p className="mt-4 text-lg font-bold text-slate-700">Selecciona una lección para ver detalle, prerrequisitos y materiales.</p>
                  </div>
                ) : loadingDetail ? (
                  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
                    <p className="mt-4 text-sm text-slate-500">Cargando detalles...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{lessonDetail?.courseTitle || "Curso"}</span>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">{lessonDetail?.topicName || currentTopic?.name || topic.title}</span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black text-slate-900">{lessonDetail?.title || selectedLesson.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">Versión: {lessonDetail?.version ?? selectedLesson.version ?? "-"}</span>
                      </div>
                    </div>

                    {lessonPrereqs.length > 0 && (
                      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Lock size={18} className="text-teal-600" />
                          <h4 className="text-lg font-black text-slate-900">Requisitos previos</h4>
                        </div>

                        <div className="mt-4 space-y-3">
                          {lessonPrereqs.map((prereq) => (
                            <div key={prereq.id} className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                              <p className="text-sm font-black text-slate-900">{prereq.topicName}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                Dominio requerido: <span className="font-black text-orange-700">{Math.round((prereq.minMastery || 0) * 100)}%</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-cyan-600" />
                        <h4 className="text-lg font-black text-slate-900">Study Rules recomendadas</h4>
                      </div>

                      {loadingStudyRules ? (
                        <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={15} className="animate-spin" /> Cargando reglas...
                        </p>
                      ) : studyRulesError ? (
                        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                          {studyRulesError}
                        </p>
                      ) : studyRules.length ? (
                        <div className="mt-4 space-y-3">
                          {studyRules.slice(0, 5).map((rule) => (
                            <div key={rule.id || `${rule.scope}-${rule.name}`} className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-black text-slate-900">{rule.name || "Regla"}</p>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-cyan-700 border border-cyan-200">
                                  {String(rule.scope || "general").toUpperCase()}
                                </span>
                              </div>
                              {rule.definition?.description ? (
                                <p className="mt-2 text-sm text-slate-700">{rule.definition.description}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-600">
                          No hay study rules configuradas para este tema.
                        </p>
                      )}
                    </section>
                    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-sky-600" />
                        <h4 className="text-lg font-black text-slate-900">Materiales de estudio</h4>
                      </div>

                      {contentPrereqs.length > 0 ? (
                        <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Prerrequisitos de contenido</p>
                          <p className="mt-1 text-sm text-slate-700">
                            {contentPrereqs.length} requisitos de contenido detectados para esta lección.
                          </p>
                        </div>
                      ) : null}

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {loadingLessonProgress ? (
                          <span className="inline-flex items-center gap-2"><Clock3 size={15} className="animate-spin" /> Cargando progreso de la lección...</span>
                        ) : lessonProgress ? (
                          <span>
                            Progreso de la lección:
                            <strong>{lessonProgress.lastPosition ? ` · ${lessonProgress.lastPosition}` : " 0%"}</strong>
                          </span>
                        ) : (
                          <span>Esta lección todavía no tiene progreso registrado.</span>
                        )}
                      </div>

                      {lessonContent.length === 0 ? (
                        <div className="py-10 text-center text-slate-500">
                          <BookOpen size={40} className="mx-auto mb-2 text-slate-300" />
                          <p>No hay materiales disponibles aún</p>
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          {lessonContent.map((content, index) => (
                            <button
                              key={content.id}
                              type="button"
                              disabled={String(lessonProgress?.status || "").toLowerCase() !== "completed" && index > maxUnlockedMaterialIndex}
                              onClick={() => handleOpenContent(content, index)}
                              className={[
                                "text-left rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md",
                                index > maxUnlockedMaterialIndex && String(lessonProgress?.status || "").toLowerCase() !== "completed"
                                  ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
                                  : "border-slate-200 bg-[linear-gradient(180deg,rgba(248,252,255,0.95),rgba(236,253,255,0.85))]",
                              ].join(" ")}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                                  <BookOpen size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-black text-slate-900 line-clamp-1">{content.title || content.modality || "Material"}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{getModalidadLabel(content.modality)}</span>
                                    {content.estimatedMinutes != null ? (
                                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">{formatMinutes(content.estimatedMinutes)}</span>
                                    ) : null}
                                    {content.difficultyProfile ? (
                                      <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-700">{getDificultadLabel(content.difficultyProfile)}</span>
                                    ) : null}
                                    {index > maxUnlockedMaterialIndex && String(lessonProgress?.status || "").toLowerCase() !== "completed" ? (
                                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">Bloqueado</span>
                                    ) : null}
                                  </div>

                                  <p className="mt-3 text-xs leading-5 text-slate-500 line-clamp-2">
                                    {content.summary || content.contentUrl || "Haz clic para abrir el material"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {variantLoading ? (
                        <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={15} className="animate-spin" /> Cargando material...
                        </p>
                      ) : variantError ? (
                        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                          {variantError}
                        </p>
                      ) : selectedVariant ? (
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                          <div className="border-b border-slate-100 px-4 py-4">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Material seleccionado</p>
                            <p className="mt-1 text-sm font-black text-slate-900">
                              {selectedVariant?.payload?.contentUrl || selectedVariant?.title }
                            </p>
                          </div>

                          {selectedVariant?.payload?.bodyHtml ? (
                            <div
                              ref={contentViewportRef}
                              className="max-h-[420px] overflow-y-auto px-4 py-5 text-slate-700 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-slate-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:mb-3 [&_p]:leading-7 [&_p]:text-slate-700 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:leading-7 [&_strong]:font-bold"
                              dangerouslySetInnerHTML={{
                                __html: selectedVariant.payload.bodyHtml,
                              }}
                            />
                          ) : (
                            <div className="px-4 py-5 text-sm text-slate-600">
                              {selectedVariant?.payload?.contentUrl || "Este material no tiene contenido HTML disponible."}
                            </div>
                          )}

                          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-semibold text-slate-500">
                              {selectedContentIndex != null ? `Material ${selectedContentIndex + 1} de ${lessonContent.length}` : "Material abierto"}
                            </p>

                            <button
                              type="button"
                              onClick={handleAdvanceMaterial}
                              disabled={variantLoading || String(lessonProgress?.status || "").toLowerCase() === "completed" || (selectedVariant?.payload?.bodyHtml ? !canAdvanceMaterial : false)}
                              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-teal-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {String(lessonProgress?.status || "").toLowerCase() === "completed"
                                ? "Lección completada"
                                : selectedContentIndex != null && selectedContentIndex >= lessonContent.length - 1
                                ? "Completar lección"
                                : "Siguiente material"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
