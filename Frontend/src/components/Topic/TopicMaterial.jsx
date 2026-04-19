import React from "react";
import { BookOpen, FileText, PlayCircle, Clock } from "lucide-react";
import "./TopicMaterial.css";

export default function TopicMaterial({ onOpen }) {
  const materials = [
    {
      id: 1,
      icon: <BookOpen size={26} className="purple" />,
      title: "Ejercicios Interactivos",
      desc: "Ejercicios sobre técnicas avanzadas de lectura",
      tag: "intermediate",
      contentType: "interactive",
    },
    {
      id: 2,
      icon: <FileText size={26} className="red" />,
      title: "Guía Completa de Razonamiento Verbal",
      desc: "Manual completo con teoría, ejemplos y ejercicios resueltos",
      tag: "beginner",
      contentType: "pdf",
    },
    {
      id: 3,
      icon: <PlayCircle size={26} className="green" />,
      title: "Curso en Video: Técnicas de Comprensión",
      desc: "Serie de videos explicativos sobre técnicas avanzadas de lectura",
      tag: "intermediate",
      extra: "180 minutos",
      contentType: "video",
    },
  ];

  return (
    <div className="material-grid">
      {materials.map((m) => (
        <div className="material-card" key={m.id} onClick={() => onOpen(m)}>
          {m.icon}
          <div className="material-info">
            <h3>{m.title}</h3>
            <p>{m.desc}</p>

            {m.extra && (
              <div className="material-extra">
                <Clock size={15} />
                <span>{m.extra}</span>
              </div>
            )}
          </div>
          <span className={`tag ${m.tag}`}>{m.tag}</span>
        </div>
      ))}
    </div>
  );
}
