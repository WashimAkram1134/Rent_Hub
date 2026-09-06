"use client";

import { Check } from "lucide-react";

const STEPS = [
  { key: "consent", label: "Consent" },
  { key: "document", label: "ID Document" },
  { key: "selfie", label: "Live Selfie" },
  { key: "result", label: "Complete" },
];

interface StepIndicatorProps {
  currentStep: string;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full flex items-center justify-center gap-0">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isDone ? "bg-emerald-500 text-white" : ""}
                  ${isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-200" : ""}
                  ${!isDone && !isActive ? "bg-slate-100 text-slate-400 border-2 border-slate-200" : ""}
                `}
              >
                {isDone ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive
                    ? "text-indigo-600"
                    : isDone
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-1 transition-all duration-500 ${
                  index < currentIndex ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
