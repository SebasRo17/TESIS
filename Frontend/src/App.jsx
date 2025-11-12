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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {isRegister ? (
          <RegisterForm onToggleMode={() => setIsRegister(false)} />
        ) : (
          <LoginForm onToggleMode={() => setIsRegister(true)} />
        )}
      </div>
    );
  }

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
          subjectId={subjectId}
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
