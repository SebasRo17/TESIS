import React from "react";
import { FileText, Play, BookOpen, BarChart3 } from "lucide-react";
import "./SubjectMaterials.css";

export default function SubjectMaterials() {
  const materials = [
    { icon: FileText, color: "#3b82f6", title: "Guía de Estudio PDF", desc: "Material completo de la materia" },
    { icon: Play, color: "#16a34a", title: "Videos Explicativos", desc: "Lecciones en video paso a paso" },
    { icon: BookOpen, color: "#8b5cf6", title: "Ejercicios Interactivos", desc: "Practica con ejercicios dinámicos" },
    { icon: BarChart3, color: "#f97316", title: "Banco de Preguntas", desc: "Miles de preguntas de práctica" },
  ];

  return (
    <div className="materials-container">
      <h2>Material de Estudio</h2>
      <div className="materials-grid">
        {materials.map((m, i) => (
          <div className="material-card" key={i}>
            <m.icon size={22} style={{ color: m.color }} />
            <div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
