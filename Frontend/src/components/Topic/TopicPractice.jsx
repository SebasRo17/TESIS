import React from "react";
import { FileText, Star } from "lucide-react";
import "./TopicPractice.css";

export default function TopicPractice({ onOpen }) {
  const items = [
    {
      id: 1,
      icon: <FileText size={26} className="blue" />,
      title: "Ejercicios Básicos",
      questions: "15 preguntas • 20 min",
      desc: "Practica los conceptos fundamentales del tema",
      level: "basic"
    },
    {
      id: 2,
      icon: <Star size={26} className="orange" />,
      title: "Ejercicios Avanzados",
      questions: "10 preguntas • 25 min",
      desc: "Desafíos más complejos para dominar el tema",
      level: "advanced"
    },
  ];

  return (
    <div className="practice-grid">
      {items.map((p) => (
        <div className="practice-card" key={p.id} onClick={() => onOpen(p)}>
          {p.icon}
          <div className="practice-info">
            <h3>{p.title}</h3>
            <p className="questions">{p.questions}</p>
            <p className="desc">{p.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
