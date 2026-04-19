// src/components/Subject/SubjectView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Play, LineChart } from "lucide-react";

import SubjectOverview from "./SubjectOverview";
import SubjectTopics from "./SubjectTopics";
import SubjectMaterials from "./SubjectMaterials";
import SubjectSimulator from "./SubjectSimulator";
import TopicDetail from "../Topic/TopicDetail";

import { getCourseByIdRequest } from "../../services/coursesService";

export default function SubjectView({ onBack }) {
  const { subjectId } = useParams(); // en tu ruta es /app/subject/:subjectId
  const id = useMemo(() => Number(subjectId), [subjectId]);

  const [activeTab, setActiveTab] = useState("resumen");
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // modo detalle de tema
  const [mode, setMode] = useState("tabs"); // "tabs" | "topic"
  const [selectedTopic, setSelectedTopic] = useState(null);

  const tabs = [
    { id: "resumen", label: "Resumen", icon: LineChart },
    { id: "temas", label: "Temas", icon: BookOpen },
    { id: "materiales", label: "Material de estudio", icon: FileText },
    { id: "simulador", label: "Simulador", icon: Play },
  ];

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingCourse(true);
      try {
        const c = await getCourseByIdRequest(id);
        if (!alive) return;
        setCourse(c);
      } catch (e) {
        if (!alive) return;
        setCourse(null);
      } finally {
        if (alive) setLoadingCourse(false);
      }
    }

    if (Number.isFinite(id) && id > 0) load();
    else setLoadingCourse(false);

    return () => {
      alive = false;
    };
  }, [id]);

  const handleOpenTopic = (topicFromApi) => {
    // TopicDetail en tu front usa title/desc, así que mapeamos:
    const mapped = {
      id: topicFromApi.id,
      title: topicFromApi.name,
      desc: topicFromApi.description,
      // si luego quieres, puedes pasar breadcrumb/children aquí también
      _raw: topicFromApi,
    };
    setSelectedTopic(mapped);
    setMode("topic");
  };

  const handleBackFromTopic = () => {
    setMode("tabs");
    setSelectedTopic(null);
  };

  if (mode === "topic" && selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={handleBackFromTopic} />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-teal-500/90 via-cyan-500/80 to-sky-600/90">
            <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_60%_80%,rgba(139,92,246,0.18),transparent_45%)]" />

            <button
              onClick={onBack}
              className="relative inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Volver al Dashboard
            </button>

            <div className="relative mt-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <BookOpen size={26} />
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  {loadingCourse ? "Cargando..." : course?.title ?? "Curso"}
                </h1>
                <p className="mt-1 text-slate-700">
                  {loadingCourse ? " " : course?.description ?? " "}
                </p>

                <div className="mt-3 inline-flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                    {course?.code ?? "CURSO"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    {course?.status ?? "active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs más vivos */}
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
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
              subject={{
                // para no tocar SubjectOverview ahora, le pasamos algo compatible:
                name: course?.title ?? "Curso",
                description: course?.description ?? "",
              }}
            />
          )}

          {activeTab === "temas" && (
            <SubjectTopics courseId={id} onOpenTopic={handleOpenTopic} />
          )}

          {activeTab === "materiales" && <SubjectMaterials />}

          {activeTab === "simulador" && <SubjectSimulator />}
        </div>
      </div>
    </div>
  );
}
