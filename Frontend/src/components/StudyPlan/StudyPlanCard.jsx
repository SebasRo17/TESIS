import React from "react";
import { Clock, Target } from "lucide-react";

export default function StudyPlanCard({ plan, onSelect }) {
  return (
    <div
      onClick={() => onSelect(plan.id)}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{plan.title}</h4>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <Target className="h-5 w-5" />
          <Clock className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Avance</span>
          <span className="font-semibold text-gray-900">{plan.progress}%</span>
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${plan.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
