import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "./contexts/AuthContext";

import Header from "./components/Layout/Header";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ProfilePage from "./components/Auth/MeProfile";

import Dashboard from "./components/Dashboard/Dashboard";
import SubjectView from "./components/Subject/SubjectView";
import StudyPlanDetail from "./components/StudyPlan/StudyPlanDetail";
import GeneralSimulator from "./components/Simulator/GeneralSimulator";

import ProtectedRoute from "./components/Routes/ProtectedRoute";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import { getCourseByIdRequest } from "./services/coursesService";

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
  return (
    <StudyPlanDetail planId={planId} onBack={() => nav("/app/dashboard")} />
  );
}

function SubjectRoute() {
  const { subjectId } = useParams();
  const nav = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = await getCourseByIdRequest(Number(subjectId));

        if (!alive) return;
        setCourse(data);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "No se pudo cargar el curso.";
        setErr(msg);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [subjectId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {err}
        </div>
        <button
          onClick={() => nav("/app/dashboard")}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <SubjectView
      subject={{
        id: course?.id,
        code: course?.code,
        name: course?.title,
        description: course?.description,
        status: course?.status,
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
          path="profile"
          element={
            <AppLayout>
              <ProfilePage />
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
