import React from "react";
import { Clock } from "lucide-react";
import "./SubjectSimulator.css";

export default function SubjectSimulator() {
  return (
    <div className="simulator-container">
      <Clock size={46} className="simulator-icon" />
      <h2 className="simulator-title">Simulador de Examen</h2>
      <p className="simulator-subtitle">Practica con 3 preguntas en 10 minutos</p>

      <div className="simulator-info">
        <div className="sim-box blue">
          <p className="big">3</p>
          <span>Preguntas</span>
        </div>
        <div className="sim-box green">
          <p className="big">10</p>
          <span>Minutos</span>
        </div>
        <div className="sim-box orange">
          <p className="big">60%</p>
          <span>Mín. Aprobatorio</span>
        </div>
      </div>

      <button className="simulator-btn">Iniciar Simulador</button>
    </div>
  );
}
