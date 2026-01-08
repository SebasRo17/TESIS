import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { generalQuestions } from "../../data/mockData";

export default function GeneralSimulator({ onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const question = generalQuestions[currentIndex];

  const handleAnswer = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));

    if (currentIndex === generalQuestions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);
  };

  const total = generalQuestions.length;
  const correctCount = generalQuestions.filter((q) => {
    const ans = answers[q.id];
    return ans === q.correctIndex;
  }).length;

  if (finished) {
    const score = Math.round((correctCount / total) * 100);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Resultado del simulacro
          </h1>
          <p className="text-gray-600 mb-4">
            Resumen de tu desempeño en este simulacro general.
          </p>

          <p className="text-sm text-gray-600">Puntaje</p>
          <p className="text-4xl font-extrabold text-gray-900 mb-4">
            {score}%
          </p>

          <p className="text-sm text-gray-600">
            Preguntas correctas:{" "}
            <span className="font-semibold text-green-600">
              {correctCount}
            </span>{" "}
            de {total}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revisión rápida
          </h2>
          <ul className="space-y-4">
            {generalQuestions.map((q) => {
              const ans = answers[q.id];
              const correct = ans === q.correctIndex;
              return (
                <li
                  key={q.id}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <p className="font-medium text-gray-800">
                      {q.question}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tu respuesta:{" "}
                    {ans != null ? q.options[ans] : "sin responder"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Correcta: {q.options[q.correctIndex]}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Repetir simulacro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista mientras responde
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Simulacro general
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Pregunta {currentIndex + 1} de {total}
            </span>
          </div>
        </div>

        <p className="text-gray-800 font-medium mb-4">{question.question}</p>

        <div className="space-y-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
