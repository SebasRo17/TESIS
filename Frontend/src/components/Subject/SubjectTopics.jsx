import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import "./SubjectTopics.css";

export default function SubjectTopics({ onOpenTopic }) {
  const topics = [
    {
      id: 1,
      title: "Comprensión Lectora",
      desc: "Técnicas de lectura comprensiva",
      progress: 100,
    },
    {
      id: 2,
      title: "Analogías",
      desc: "Relaciones lógicas entre palabras",
      progress: 100,
    },
    {
      id: 3,
      title: "Antónimos y Sinónimos",
      desc: "Relaciones semánticas",
      progress: 100,
    },
    {
      id: 4,
      title: "Conectores Lógicos",
      desc: "Uso correcto de conectores",
      progress: 45,
    },
  ];

  const handleClick = (topic) => {
    if (onOpenTopic) {
      onOpenTopic(topic); // 👈 le aviso al padre qué tema se eligió
    }
  };

  return (
    <div className="topics-grid">
      {topics.map((t) => (
        <div
          key={t.id}
          className={`topic-card ${t.progress === 100 ? "done" : ""}`}
          onClick={() => handleClick(t)}  // 👈 toda la caja es clickeable
        >
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
            />
          </div>
        </div>
      ))}
    </div>
  );
}
