import React, { useState } from "react";
import { ArrowLeft, BookOpen, FileText, Notebook, MonitorPlay } from "lucide-react";
import TopicDescription from "./TopicDescription";
import TopicMaterial from "./TopicMaterial";
import TopicPractice from "./TopicPractice";
import TopicSimulator from "./TopicSimulator";
import MaterialDetail from "../Material/MaterialDetail";
import PracticeDetail from "../Material/PracticeDetail";
import "./TopicDetail.css";

export default function TopicDetail({ topic, onBack }) {
  const [tab, setTab] = useState("descripcion");

  // controladores para abrir vistas internas
  const [openMaterial, setOpenMaterial] = useState(null);
  const [openPractice, setOpenPractice] = useState(null);

  if (!topic) return null;

  // Mostrar detalle de material
  if (openMaterial) {
    return (
      <MaterialDetail
        item={openMaterial}
        onBack={() => setOpenMaterial(null)}
      />
    );
  }

  // Mostrar detalle de práctica
  if (openPractice) {
    return (
      <PracticeDetail
        item={openPractice}
        onBack={() => setOpenPractice(null)}
      />
    );
  }

  return (
    <div className="topicDetail-container">

      <button className="topicDetail-backBtn" onClick={onBack}>
        <ArrowLeft size={18} /> Volver a Temas
      </button>

      <div className="topicDetail-header">
        <div className="topicDetail-icon">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="topicDetail-title">{topic.title}</h1>
          <p className="topicDetail-subtitle">{topic.desc}</p>
        </div>
      </div>

      <div className="topicDetail-tabs">

        <button
          className={tab === "descripcion" ? "active" : ""}
          onClick={() => setTab("descripcion")}
        >
          <FileText size={16} /> Descripción
        </button>

        <button
          className={tab === "material" ? "active" : ""}
          onClick={() => setTab("material")}
        >
          <Notebook size={16} /> Material
        </button>

        <button
          className={tab === "practica" ? "active" : ""}
          onClick={() => setTab("practica")}
        >
          <BookOpen size={16} /> Práctica
        </button>

        {/* NUEVA PESTAÑA SIMULADOR */}
        <button
          className={tab === "simulador" ? "active" : ""}
          onClick={() => setTab("simulador")}
        >
          <MonitorPlay size={16} /> Simulador
        </button>
      </div>

      <div className="topicDetail-content">
        {tab === "descripcion" && <TopicDescription />}

        {tab === "material" && (
          <TopicMaterial onOpen={(item) => setOpenMaterial(item)} />
        )}

        {tab === "practica" && (
          <TopicPractice onOpen={(item) => setOpenPractice(item)} />
        )}

        {tab === "simulador" && <TopicSimulator />}
      </div>

    </div>
  );
}
