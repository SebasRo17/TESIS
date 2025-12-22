import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";
import { studyPlans, studyPlanTasks } from "../../data/mockData";
import SubjectTopics from "../Subject/SubjectTopics";
import TopicDetail from "../Topic/TopicDetail";
import "./StudyPlanDetail.css";

export default function StudyPlanDetail({ planId, onBack }) {
  const plan = studyPlans.find((p) => p.id === planId);
  const tasks = studyPlanTasks[planId] ?? [];

  // Estado de tareas completadas (ya lo tenías)
  const [completed, setCompleted] = useState(() => new Set());

  // NUEVO → controla qué pantalla se muestra
  const [activeTab, setActiveTab] = useState("resumen");
  const [view, setView] = useState("tabs"); // tabs | topicDetail
  const [selectedTopic, setSelectedTopic] = useState(null);

  const toggle = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!plan) {
    return (
      <div className="planDetail-container">
        <button className="planDetail-backBtn" onClick={onBack}>
          <ArrowLeft size={18} /> Volver
        </button>
        <p className="planDetail-textMuted">Plan no encontrado.</p>
      </div>
    );
  }

  // Cálculo del progreso
  const completion = tasks.length
    ? Math.round((completed.size / tasks.length) * 100)
    : 0;

  const suggested = tasks.find((t) => !completed.has(t.id));

  // NUEVO → cuando se hace click en un tema desde SubjectTopics
  const openTopic = (topicId) => {
    setSelectedTopic(topicId);
    setView("topicDetail");
  };

  // NUEVO → volver a los tabs
  const goBackToTabs = () => {
    setSelectedTopic(null);
    setView("tabs");
  };

  // SI ESTOY DENTRO DE UN TEMA → muestro TopicDetail.jsx
  if (view === "topicDetail") {
    return (
      <TopicDetail topicId={selectedTopic} onBack={goBackToTabs} />
    );
  }

  return (
    <div className="planDetail-container">
      {/* VOLVER */}
      <button className="planDetail-backBtn" onClick={onBack}>
        <ArrowLeft size={18} /> Volver
      </button>

      {/* CARD PRINCIPAL */}
      <div className="planDetail-card">
        <div className="planDetail-header">
          <div>
            <h1 className="planDetail-title">{plan.title}</h1>
            <p className="planDetail-subtitle">{plan.description}</p>
          </div>
          <span className="planDetail-week">Semana 1</span>
        </div>

        <div className="planDetail-progressSection">
          <p className="planDetail-progressTitle">Progreso</p>
          <div className="planDetail-progressBar">
            <div
              className="planDetail-progressFill"
              style={{ width: `${completion}%` }}
            ></div>
          </div>

          <div className="planDetail-progressInfo">
            <div className="planDetail-progressItem">
              <CheckCircle2 size={16} className="planDetail-iconCheck" />
              {completed.size}/{tasks.length} tareas
            </div>
            <div className="planDetail-progressItem">
              <Clock size={16} className="planDetail-iconClock" /> 12h estimadas
            </div>
          </div>
        </div>

        {suggested && (
          <div className="planDetail-nextTask">
            <p className="planDetail-nextLabel">Siguiente tarea sugerida</p>
            <div className="planDetail-nextContent">
              <span className="planDetail-nextName">
                {suggested.label} ({suggested.minutes ?? 45} min)
              </span>
              <button className="planDetail-startBtn">Comenzar</button>
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      {/* <div className="planDetail-tabs">
        <button
          className={activeTab === "resumen" ? "active" : ""}
          onClick={() => setActiveTab("resumen")}
        >
          Resumen
        </button>
        <button
          className={activeTab === "temas" ? "active" : ""}
          onClick={() => setActiveTab("temas")}
        >
          Temas
        </button>
        <button
          className={activeTab === "material" ? "active" : ""}
          onClick={() => setActiveTab("material")}
        >
          Material de Estudio
        </button>
        <button
          className={activeTab === "simulador" ? "active" : ""}
          onClick={() => setActiveTab("simulador")}
        >
          Simulador
        </button>
      </div> */}

      {/* CONTENIDO SEGÚN TAB */}
      {activeTab === "resumen" && (
        <div className="planDetail-summary">
          <h2 className="planDetail-tasksTitle">Tareas del plan</h2>
          <ul className="planDetail-taskList">
            {tasks.map((t) => {
              const done = completed.has(t.id);
              return (
                <li key={t.id} className="planDetail-taskItem">
                  <button
                    onClick={() => toggle(t.id)}
                    className="planDetail-checkBtn"
                  >
                    {done ? (
                      <CheckCircle2 className="planDetail-check done" />
                    ) : (
                      <Circle className="planDetail-check" />
                    )}
                  </button>
                  <div className="planDetail-taskInfo">
                    <p className={`planDetail-taskName ${done ? "done" : ""}`}>
                      {t.label}
                    </p>
                    <p className="planDetail-taskMeta">
                      {t.type} • {t.minutes ?? 60} min{" "}
                      <span className="planDetail-tags">
                        {t.subjectId && `• ${t.subjectId}`}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {activeTab === "temas" && (
        <SubjectTopics onOpenTopic={openTopic} />
      )}

      {activeTab === "material" && (
        <p className="planDetail-textMuted">
          Material de ejemplo… aquí estarán PDFs, videos, guías, etc.
        </p>
      )}

      {activeTab === "simulador" && (
        <p className="planDetail-textMuted">
          Aquí se abrirá el simulador personalizado del plan.
        </p>
      )}
    </div>
  );
}
