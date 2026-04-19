import React from "react";
import "./SubjectOverview.css";

export default function SubjectOverview({ subject }) {
  return (
    <div className="overview-container">
      <h2 className="overview-title">Resumen de tu progreso</h2>
      <div className="overview-grid">
        <div className="overview-card green">
          <h3>Progreso total</h3>
          <p className="big">85%</p>
        </div>
        <div className="overview-card blue">
          <h3>Temas completados</h3>
          <p className="big">12 / 15</p>
        </div>
        <div className="overview-card purple">
          <h3>Tiempo total de estudio</h3>
          <p className="big">18h</p>
        </div>
        <div className="overview-card orange">
          <h3>Simulacros realizados</h3>
          <p className="big">6</p>
        </div>
      </div>

      <div className="overview-bottom">
        <p>
          ¡Excelente trabajo en <strong>{subject.name}</strong>! Has
          completado gran parte de los temas con un ritmo constante.
          Revisa los materiales de apoyo o practica con los simuladores
          para consolidar tu aprendizaje.
        </p>
      </div>
    </div>
  );
}
