import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import "./SubjectTopics.css";

export default function SubjectTopics() {
  const topics = [
    { title: "Comprensión Lectora", desc: "Técnicas de lectura comprensiva", progress: 100 },
    { title: "Analogías", desc: "Relaciones lógicas entre palabras", progress: 100 },
    { title: "Antónimos y Sinónimos", desc: "Relaciones semánticas", progress: 100 },
    { title: "Conectores Lógicos", desc: "Uso correcto de conectores", progress: 45 },
  ];

  return (
    <div className="topics-grid">
      {topics.map((t, i) => (
        <div className={`topic-card ${t.progress === 100 ? "done" : ""}`} key={i}>
          <div className="topic-header">
            {t.progress === 100 ? (
              <CheckCircle2 className="topic-icon green" />
            ) : (
              <Clock className="topic-icon blue" />
            )}
            <div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          </div>
          <p className="topic-progress-label">Progreso</p>
          <div className="topic-progress-bar">
            <div
              className={`fill ${t.progress === 100 ? "green" : "blue"}`}
              style={{ width: `${t.progress}%` }}
            ></div>
          </div>
          <div className="topic-actions">
            <span>Estudiar</span>
            <span>Ejercicios</span>
            <span>Práctica</span>
          </div>
        </div>
      ))}
    </div>
  );
}
