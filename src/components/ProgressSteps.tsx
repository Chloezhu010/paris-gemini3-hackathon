"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Navigate to landing page",
  "Capture landing page",
  "Find signup CTA",
  "Click through to auth",
  "Capture sign-up screen",
  "Analyze flow with Gemini",
];

const STEP_DURATION_MS = 1800;

export default function ProgressSteps() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, STEP_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#1f2937] mb-2">Analyzing onboarding flow</h3>
        <div className="w-full bg-[#e5e7eb] h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#6d28d9] to-[#ec4899] h-full transition-all duration-500 ease-out"
            style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
      <ol className="space-y-3 font-mono">
        {STEPS.map((label, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li key={label} className="flex items-center gap-4">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center font-semibold text-xs transition-all duration-300"
                style={{
                  backgroundColor: isDone ? "#d1d5db" : isActive ? "#6d28d9" : "#e5e7eb",
                  color: isDone ? "#6b7280" : isActive ? "#ffffff" : "#1f2937",
                }}
              >
                {isDone && "✓"}
                {isActive && <span className="animate-pulse">●</span>}
                {!isDone && !isActive && i + 1}
              </div>
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color: isDone ? "#d1d5db" : isActive ? "#6d28d9" : "#6b7280",
                  textDecoration: isDone ? "line-through" : "none",
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
