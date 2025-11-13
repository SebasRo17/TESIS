import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Play,
  LineChart,
} from "lucide-react";
import "./SubjectView.css";
import SubjectOverview from "./SubjectOverview";
import SubjectTopics from "./SubjectTopics";
import SubjectMaterials from "./SubjectMaterials";
import SubjectSimulator from "./SubjectSimulator";

export default function SubjectView({ subject, onBack }) {
  const [activeTab, setActiveTab] = useState("resumen");

  const tabs = [
    { id: "resumen", label: "Resumen", icon: LineChart },
    { id: "temas", label: "Temas", icon: BookOpen },
    { id: "materiales", label: "Materiales", icon: FileText },
    { id: "simulador", label: "Simulador", icon: Play },
  ];

  return (
    <div className="subject-container">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Volver al Dashboard
      </button>

      <div className="subject-header">
        <div className="subject-icon">
          <BookOpen size={26} />
        </div>
        <div>
          <h1 className="subject-title">{subject.name}</h1>
          <p className="subject-subtitle">{subject.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="subject-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "resumen" && <SubjectOverview subject={subject} />}
        {activeTab === "temas" && <SubjectTopics />}
        {activeTab === "materiales" && <SubjectMaterials />}
        {activeTab === "simulador" && <SubjectSimulator />}
      </div>
    </div>
  );
}
