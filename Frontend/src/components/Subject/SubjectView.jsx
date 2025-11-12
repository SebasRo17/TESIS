import React from "react";
import { ArrowLeft, BookOpen, Calculator, AlertCircle } from "lucide-react";
import { subjects, subjectTopics } from "../../data/mockData";

export default function SubjectView({ subjectId, onBack }) {
  const subject = subjects.find((s) => s.id === subjectId);

  if (!subject) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al dashboard
        </button>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-red-800">
              Materia no encontrada
            </h2>
            <p className="text-sm text-red-700">
              Intenta volver al dashboard y seleccionar una materia válida.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = subject.id === "verbal" ? BookOpen : Calculator;
  const topics = subjectTopics[subject.id] ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              subject.id === "verbal"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {subject.name}
            </h1>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <div>
            <p className="text-sm text-gray-600">Progreso</p>
            <p className="text-2xl font-bold text-gray-900">
              {subject.progress}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Temas completados</p>
            <p className="text-2xl font-bold text-gray-900">
              {subject.completedTopics}/{subject.totalTopics}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              subject.id === "verbal" ? "bg-purple-500" : "bg-blue-600"
            }`}
            style={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Temas de la materia
        </h2>
        {topics.length === 0 ? (
          <p className="text-sm text-gray-600">
            Aún no hay temas configurados para esta materia.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t) => (
              <article
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t.title}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Dificultad:{" "}
                    <span className="font-semibold">
                      {t.difficulty.toUpperCase()}
                    </span>
                  </p>
                </div>
                <button className="mt-4 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Practicar tema
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
