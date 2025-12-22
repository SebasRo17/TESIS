import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

import Header from "./components/Layout/Header";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";

import Dashboard from "./components/Dashboard/Dashboard";
import SubjectView from "./components/Subject/SubjectView";
import StudyPlanDetail from "./components/StudyPlan/StudyPlanDetail";
import GeneralSimulator from "./components/Simulator/GeneralSimulator";

function AppContent() {
  const { user } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [view, setView] = useState("dashboard");
  const [subjectId, setSubjectId] = useState("");
  const [planId, setPlanId] = useState("");

  // ======= PANTALLA DE AUTENTICACIÓN =======
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-slate-950">
        {/* Burbujas de color */}
        <div className="pointer-events-none absolute -left-32 -top-40 h-72 w-72 rounded-full bg-violet-500/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-10 top-10 h-40 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-400/10 to-purple-500/10 blur-2xl" />

        {/* Aquí va el card (login o registro) */}
        {isRegister ? (
          <RegisterForm onToggleMode={() => setIsRegister(false)} />
        ) : (
          <LoginForm onToggleMode={() => setIsRegister(true)} />
        )}
      </div>
    );
  }

  // ======= RESTO DE LA APP (YA LOGUEADO) =======
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {view === "dashboard" && (
        <Dashboard
          onSubjectSelect={(id) => {
            setSubjectId(id);
            setView("subject");
          }}
          onGeneralSimulator={() => {
            setView("generalSimulator");
          }}
          onStudyPlanSelect={(id) => {
            setPlanId(id);
            setView("studyPlan");
          }}
        />
      )}

      {view === "studyPlan" && (
        <StudyPlanDetail planId={planId} onBack={() => setView("dashboard")} />
      )}

      {view === "subject" && (
        <SubjectView
          subject={{
            name: "Razonamiento Verbal",
            description: "Comprensión lectora, analogías, antónimos y sinónimos",
          }}
          onBack={() => setView("dashboard")}
        />
      )}

      {view === "generalSimulator" && (
        <GeneralSimulator onBack={() => setView("dashboard")} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
