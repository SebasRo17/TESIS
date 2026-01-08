import React from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext";

import Header from "./components/Layout/Header";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";

import Dashboard from "./components/Dashboard/Dashboard";
import SubjectView from "./components/Subject/SubjectView";
import StudyPlanDetail from "./components/StudyPlan/StudyPlanDetail";
import GeneralSimulator from "./components/Simulator/GeneralSimulator";

import ProtectedRoute from "./components/Routes/ProtectedRoute";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function AuthShell({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-slate-950">
      {/* Burbujas de color */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-72 w-72 rounded-full bg-violet-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-500/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-10 top-10 h-40 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-400/10 to-purple-500/10 blur-2xl" />
      {children}
    </div>
  );
}

function LoginRoute() {
  const { user, isBootstrapping } = useAuth();
  const nav = useNavigate();
  if (!isBootstrapping && user) return <Navigate to="/app/dashboard" replace />;
  return (
    <AuthShell>
      <LoginForm onToggleMode={() => nav("/register")} />
    </AuthShell>
  );
}

function RegisterRoute() {
  const { user, isBootstrapping } = useAuth();
  const nav = useNavigate();
  if (!isBootstrapping && user) return <Navigate to="/app/dashboard" replace />;
  return (
    <AuthShell>
      <RegisterForm onToggleMode={() => nav("/login")} />
    </AuthShell>
  );
}

function HomeRedirect() {
  const { user, isBootstrapping } = useAuth();
  if (isBootstrapping) return null;
  return <Navigate to={user ? "/app/dashboard" : "/login"} replace />;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {children}
    </div>
  );
}

function DashboardRoute() {
  const nav = useNavigate();
  return (
    <Dashboard
      onSubjectSelect={(id) => nav(`/app/subject/${id}`)}
      onGeneralSimulator={() => nav(`/app/general-simulator`)}
      onStudyPlanSelect={(id) => nav(`/app/study-plan/${id}`)}
    />
  );
}

function StudyPlanRoute() {
  const { planId } = useParams();
  const nav = useNavigate();
  return <StudyPlanDetail planId={planId} onBack={() => nav("/app/dashboard")} />;
}

function SubjectRoute() {
  const nav = useNavigate();
  // Por ahora mantenemos subject mock (puedes conectarlo a API más adelante)
  return (
    <SubjectView
      subject={{
        name: "Razonamiento Verbal",
        description: "Comprensión lectora, analogías, antónimos y sinónimos",
      }}
      onBack={() => nav("/app/dashboard")}
    />
  );
}

function GeneralSimulatorRoute() {
  const nav = useNavigate();
  return <GeneralSimulator onBack={() => nav("/app/dashboard")} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      {/* Públicas */}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protegidas */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route
          path="dashboard"
          element={
            <AppLayout>
              <DashboardRoute />
            </AppLayout>
          }
        />
        <Route
          path="study-plan/:planId"
          element={
            <AppLayout>
              <StudyPlanRoute />
            </AppLayout>
          }
        />
        <Route
          path="subject/:subjectId"
          element={
            <AppLayout>
              <SubjectRoute />
            </AppLayout>
          }
        />
        <Route
          path="general-simulator"
          element={
            <AppLayout>
              <GeneralSimulatorRoute />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
