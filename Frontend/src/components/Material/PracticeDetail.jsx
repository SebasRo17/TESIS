import React from "react";
import { ArrowLeft, FileText, Star } from "lucide-react";
import "./PracticeDetail.css";

export default function PracticeDetail({ practice, onBack }) {
  const p = practice || {
    title: "Ejercicios Básicos",
    desc: "Practica conceptos fundamentales.",
    questions: "15 preguntas • 20 minutos",
    level: "basic",
  };

  return (
    <div className="pd-wrapper">
      <button className="pd-back" onClick={onBack}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="pd-header">
        {p.level === "basic" ? (
          <FileText size={32} className="pd-icon blue" />
        ) : (
          <Star size={32} className="pd-icon orange" />
        )}

        <div>
          <h1>{p.title}</h1>
          <p className="pd-desc">{p.questions}</p>
        </div>
      </div>

      <div className="pd-content">
        <h3>Descripción</h3>
        <p>
          Esta sección muestra los detalles del ejercicio seleccionado. Aquí pueden aparecer
          preguntas, formularios, actividades o evaluaciones.
        </p>

        <div className="pd-placeholder">
          <p>Aquí se mostrarán las preguntas del ejercicio.</p>
        </div>
      </div>
    </div>
  );
}
