import React from "react";
import { ArrowLeft, BookOpen, Clock, FileText, PlayCircle } from "lucide-react";
import "./MaterialDetail.css";

export default function MaterialDetail({ material, onBack }) {
  // Info fake si no llega material
  const m = material || {
    title: "Ejercicios Interactivos",
    desc: "Ejercicios avanzados para mejorar tus habilidades de lectura.",
    level: "intermediate",
    duration: "180 minutos",
    type: "video",
  };

  const iconMap = {
    pdf: <FileText size={32} className="md-icon red" />,
    video: <PlayCircle size={32} className="md-icon green" />,
    interactive: <BookOpen size={32} className="md-icon purple" />,
  };

  return (
    <div className="md-wrapper">
      <button className="md-back" onClick={onBack}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="md-header">
        {iconMap[m.type]}
        <div>
          <h1>{m.title}</h1>
          <p className="md-desc">{m.desc}</p>
        </div>
        <span className={`md-tag ${m.level}`}>{m.level}</span>
      </div>

      <div className="md-content">
        <h3>Descripción general</h3>
        <p>
          Aquí encontrarás el contenido completo del material elegido. Se usará este espacio
          para mostrar PDFs, videos incrustados, actividades interactivas o instrucciones.
        </p>

        <div className="md-info-box">
          <Clock size={18} />
          <span>{m.duration}</span>
        </div>

        <div className="md-placeholder">
          <p>El contenido del material se mostrará aquí.</p>
        </div>
      </div>
    </div>
  );
}
