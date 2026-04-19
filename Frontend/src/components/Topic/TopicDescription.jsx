import React from "react";
import { Clock, Star, CheckCircle2 } from "lucide-react";
import "./TopicDescription.css";

export default function TopicDescription() {
  const objectives = [
    { text: "Dominar las técnicas de análisis textual", done: true },
    { text: "Identificar ideas principales y secundarias", done: true },
    { text: "Aplicar estrategias de inferencia", done: false },
    { text: "Resolver preguntas de comprensión en tiempo límite", done: false },
  ];

  return (
    <div className="desc-wrapper">
      <p className="desc-text">
        Técnicas de lectura comprensiva y análisis de textos.
      </p>

      <div className="info-grid">
        <div className="info-card blue">
          <Clock size={18} />
          <div>
            <p>Tiempo Estimado</p>
            <strong>3-4 horas</strong>
          </div>
        </div>
        <div className="info-card yellow">
          <Star size={18} />
          <div>
            <p>Dificultad</p>
            <strong>Intermedio</strong>
          </div>
        </div>
        <div className="info-card green">
          <CheckCircle2 size={18} />
          <div>
            <p>Progreso</p>
            <strong>100%</strong>
          </div>
        </div>
      </div>

      <div className="objectives-section">
        <h2 className="subtitle">Objetivos de Aprendizaje</h2>
        <ul>
          {objectives.map((obj, i) => (
            <li key={i} className={obj.done ? "done" : ""}>
              {obj.done ? <CheckCircle2 size={18} /> : <span className="circle" />}
              {obj.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
