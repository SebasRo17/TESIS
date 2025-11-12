import React from "react";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import {
  overallStats,
  weeklyRoadmap,
  subjects,
  quickActions,
} from "../../data/mockData";

import SubjectCard from "./SubjectCard";
import "./Dashboard.css";

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

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard de Preparación</h1>
        <p className="dashboard__subtitle">
          Sigue tu progreso y continúa preparándote para tu examen de admisión.
        </p>
      </div>

      {/* KPIs SUPERIORES */}
      <section className="dashboard__kpi-grid">
        <article className="dashboard__kpi-card dashboard__kpi-card--blue">
          <div>
            <div className="dashboard__kpi-label">Progreso Total</div>
            <div className="dashboard__kpi-value">{totalProgress}%</div>
          </div>
          <TrendingUp className="dashboard__kpi-icon" />
        </article>

        <article className="dashboard__kpi-card dashboard__kpi-card--green">
          <div>
            <div className="dashboard__kpi-label">Temas Completados</div>
            <div className="dashboard__kpi-value">
              {completedTopics}/{totalTopics}
            </div>
          </div>
          <Target className="dashboard__kpi-icon" />
        </article>

        <article className="dashboard__kpi-card dashboard__kpi-card--orange">
          <div>
            <div className="dashboard__kpi-label">Tiempo de Estudio</div>
            <div className="dashboard__kpi-value">{studyHours}h</div>
          </div>
          <Clock className="dashboard__kpi-icon" />
        </article>

        <article className="dashboard__kpi-card dashboard__kpi-card--purple">
          <div>
            <div className="dashboard__kpi-label">Simulacros</div>
            <div className="dashboard__kpi-value">{simulacros}</div>
          </div>
          <Award className="dashboard__kpi-icon" />
        </article>
      </section>

      {/* HOJA DE RUTA SEMANAL */}
      <section className="week-section">
        <h2 className="section-title">Hoja de Ruta Semanal</h2>
        <div className="week-grid">
          {weeklyRoadmap.map((week) => (
            <article key={week.id} className="week-card">
              <span className="week-tag">{week.tag}</span>

              <div className="week-title">
                <div className="week-icon">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="week-heading">{week.title}</h3>
                  <p className="week-subtitle">{week.description}</p>
                </div>
              </div>

              <p className="week-label">Progreso semanal</p>
              <div className="week-progress-bar">
                <div
                  className="week-progress-fill"
                  style={{ width: `${week.progress}%` }}
                />
              </div>

              <div className="week-meta">
                <span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {week.completedTasks}/{week.totalTasks} tareas
                </span>
                <span>
                  <Clock className="h-4 w-4 text-blue-500" />
                  {week.estimatedHours}h estimadas
                </span>
              </div>

              <div className="week-tasks">
                <p className="week-tasks-title">Próximas Tareas:</p>
                {week.tasks.map((t) => (
                  <div
                    key={t.id}
                    className={
                      "week-task-item " + (t.done ? "week-task-done" : "")
                    }
                  >
                    <span>{t.done ? "✔" : "○"}</span>
                    <span>
                      {t.label}{" "}
                      <span style={{ opacity: 0.75 }}>
                        ({t.minutes}min)
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="week-footer">
                <button
                  type="button"
                  className="week-plan-button"
                  onClick={() =>
                    week.planId && onStudyPlanSelect && onStudyPlanSelect(week.planId)
                  }
                >
                  Ver Plan Completo
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MATERIAS DE ESTUDIO */}
      <section className="subjects-section">
        <h2 className="section-title">Materias de Estudio</h2>
        <div className="dashboard__subjects-grid">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} onSelect={onSubjectSelect} />
          ))}
        </div>
      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="quick-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="quick-grid">
          <article className="quick-card">
            <h3 className="quick-title">{quickActions[0].title}</h3>
            <p className="quick-subtitle">{quickActions[0].subtitle}</p>
          </article>

          <article className="quick-card">
            <h3 className="quick-title">{quickActions[1].title}</h3>
            <p className="quick-subtitle">{quickActions[1].subtitle}</p>
          </article>

          <article
            className="quick-card quick-card-sim"
            onClick={onGeneralSimulator}
          >
            <h3 className="quick-title">{quickActions[2].title}</h3>
            <p className="quick-subtitle">{quickActions[2].subtitle}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
