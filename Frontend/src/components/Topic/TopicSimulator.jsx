import React, { useState } from "react";
import { PlayCircle, CheckCircle2, XCircle } from "lucide-react";
import "./TopicSimulator.css";

export default function TopicSimulator() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      q: "¿Cuál es el antónimo de 'rápido'?",
      options: ["Pequeño", "Lento", "Oscuro"],
      correct: 1,
    },
    {
      q: "Completa la analogía: Sol : Día :: Luna : ?",
      options: ["Noche", "Cielo", "Luz"],
      correct: 0,
    },
  ];

  const current = questions[index];

  function checkAnswer(i) {
    setSelected(i);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setSelected(null);

      if (index < questions.length - 1) {
        setIndex(index + 1);
      }
    }, 1200);
  }

  return (
    <div className="sim-wrapper">
      <h2 className="sim-title">
        <PlayCircle size={20} /> Simulador del Tema
      </h2>

      <div className="sim-card">
        <h3>{current.q}</h3>

        <div className="sim-options">
          {current.options.map((op, i) => (
            <button
              key={i}
              className={`sim-btn 
                ${showResult && i === current.correct ? "correct" : ""} 
                ${showResult && i === selected && i !== current.correct ? "wrong" : ""}
              `}
              disabled={showResult}
              onClick={() => checkAnswer(i)}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
