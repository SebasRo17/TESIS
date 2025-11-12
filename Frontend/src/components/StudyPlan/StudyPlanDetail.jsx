import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";
import { studyPlans, studyPlanTasks } from "../../data/mockData";
import "./StudyPlanDetail.css";

export default function StudyPlanDetail({ planId, onBack }) {
  const plan = studyPlans.find((p) => p.id === planId);
  const tasks = studyPlanTasks[planId] ?? [];

  const [completed, setCompleted] = useState(() => new Set());

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

  const completion = tasks.length
    ? Math.round((completed.size / tasks.length) * 100)
    : 0;

  const suggested = tasks.find((t) => !completed.has(t.id));

  return (
    <div className="planDetail-container">
      <button className="planDetail-backBtn" onClick={onBack}>
        <ArrowLeft size={18} /> Volver
      </button>

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

      <div className="planDetail-tasksCard">
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
    </div>
  );
}
