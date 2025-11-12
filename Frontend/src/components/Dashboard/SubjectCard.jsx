import React from "react";
import { BookOpen, Calculator, ArrowRight, CheckCircle } from "lucide-react";

export default function SubjectCard({ subject, onSelect }) {
  const Icon =
    subject.icon === "BookOpen" ? BookOpen : subject.icon === "Calculator" ? Calculator : BookOpen;

  return (
    <div
      onClick={() => onSelect(subject.id)}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-lg ${
              subject.id === "verbal"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {subject.name}
            </h3>
            <p className="text-sm text-gray-600">{subject.description}</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progreso</span>
          <span className="font-semibold text-gray-900">
            {subject.progress}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              subject.id === "verbal" ? "bg-purple-500" : "bg-blue-600"
            }`}
            style={{ width: `${subject.progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">
            {subject.completedTopics}/{subject.totalTopics} temas completados
          </span>
        </div>
      </div>
    </div>
  );
}
