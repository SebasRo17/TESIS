// src/components/Subject/SubjectView.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, LineChart } from "lucide-react";

import SubjectOverview from "./SubjectOverview";
import SubjectTopics from "./SubjectTopics";
import SubjectSimulator from "./SubjectSimulator";
import TopicDetail from "../Topic/TopicDetail";

import { getCourseBySlugRequest } from "../../services/coursesService";
import { getTopicById } from "../../services/topicsService";
import { getLessonById } from "../../services/lessonsService";

export default function SubjectView({ onBack }) {
  const { slug } = useParams(); // en tu ruta es /app/subject/:slug
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("resumen");
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // modo detalle de tema
  const [mode, setMode] = useState("tabs"); // "tabs" | "topic"
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [initialLessonId, setInitialLessonId] = useState(null);

  const tabs = [
    { id: "resumen", label: "Resumen", icon: LineChart },
    { id: "temas", label: "Temas", icon: BookOpen },
    { id: "simulador", label: "Simulador", icon: Play },
  ];

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingCourse(true);
      try {
        const c = await getCourseBySlugRequest(slug);
        if (!alive) return;
        setCourse(c);
      } catch (e) {
        if (!alive) return;
        setCourse(null);
      } finally {
        if (alive) setLoadingCourse(false);
      }
    }

    if (slug) load();
    else setLoadingCourse(false);

    return () => {
      alive = false;
    };
  }, [slug]);

  const handleOpenTopic = (topicFromApi) => {
    // TopicDetail en tu front usa title/desc, así que mapeamos:
    const mapped = {
      id: topicFromApi.id,
      title: topicFromApi.name,
      desc: topicFromApi.description,
      courseId: course?.id,
      _raw: topicFromApi,
    };
    setSelectedTopic(mapped);
    setMode("topic");
  };

  const handleBackFromTopic = () => {
    setMode("tabs");
    setSelectedTopic(null);
    setInitialLessonId(null);
  };

  useEffect(() => {
    let alive = true;

    const loadFromQuery = async () => {
      const params = new URLSearchParams(location.search || "");
      const refType = String(params.get("refType") || "").toLowerCase();
      const refId = Number(params.get("refId"));

      if (!refType) return;

      if (refType === "exam") {
        setActiveTab("simulador");
        setMode("tabs");
        setInitialLessonId(null);
        return;
      }

      if (!Number.isFinite(refId) || refId <= 0) {
        setActiveTab("temas");
        return;
      }

      try {
        if (refType === "topic") {
          const topicData = await getTopicById(refId);
          if (!alive || !topicData?.id) return;
          setActiveTab("temas");
          setInitialLessonId(null);
          handleOpenTopic(topicData);
          return;
        }

        if (refType === "lesson") {
          const lessonData = await getLessonById(refId);
          const topicId = lessonData?.primaryTopicId || lessonData?.topicId;
          if (!alive || !topicId) return;
          const topicData = await getTopicById(topicId);
          if (!alive || !topicData?.id) return;
          setActiveTab("temas");
          setInitialLessonId(refId);
          handleOpenTopic(topicData);
          return;
        }

        setActiveTab("temas");
      } catch {
        if (!alive) return;
        setActiveTab("temas");
      }
    };

    loadFromQuery();
    return () => {
      alive = false;
    };
  }, [location.search, slug]);

  if (mode === "topic" && selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={handleBackFromTopic} initialLessonId={initialLessonId} />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.12),transparent_34%),linear-gradient(180deg,#f8fffe_0%,#eefbff_46%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7.5xl px-6 py-8">
        <button
          onClick={onBack}
          className="relative inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl">
          <div className="relative p-6 bg-gradient-to-br from-teal-500/90 via-cyan-500/80 to-sky-600/90">
            <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_82%_30%,rgba(255,255,255,0.14),transparent_42%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.12),transparent_42%)]" />
            <div className="relative mt-5 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
              <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-white/15 text-white shadow-lg">
                <BookOpen size={40} />
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  {loadingCourse ? "Cargando..." : course?.title ?? "Curso"}
                </h1>
                <p className="mt-2 max-w-2xl text-white/85">
                  {loadingCourse ? " " : course?.description ?? " "}
                </p>

                <div className="mt-4 inline-flex items-center gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
                    {course?.code ?? "CURSO"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6">
            <div className="mt-4 flex flex-wrap gap-2 pb-4">
              {tabs.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={[
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition",
                      active
                        ? "bg-white text-cyan-700 border border-cyan-200 shadow-md"
                        : "bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200",
                    ].join(" ")}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "resumen" && (
            <SubjectOverview
              courseId={course?.id}
              subject={{
                name: course?.title ?? "Curso",
                description: course?.description ?? "",
              }}
            />
          )}

          {activeTab === "temas" && (
            <SubjectTopics courseId={course?.id} onOpenTopic={handleOpenTopic} />
          )}

          {activeTab === "simulador" && (
            <SubjectSimulator course={course} slug={slug} variant="preview" />
          )}
        </div>
      </div>
    </div>
  );
}
