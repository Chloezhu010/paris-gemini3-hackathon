"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Navigating to landing page…",
  "Capturing landing page…",
  "Finding signup CTA…",
  "Clicking through to auth…",
  "Capturing sign-up screen…",
  "Analyzing flow with Gemini…",
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
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6">
      <p className="mb-4 text-sm font-medium text-zinc-900">Analyzing onboarding flow</p>
      <ol className="space-y-3">
        {STEPS.map((label, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={[
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all duration-500",
                  isDone
                    ? "bg-zinc-900 text-white"
                    : isActive
                      ? "bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2"
                      : "bg-zinc-100 text-zinc-400",
                ].join(" ")}
              >
                {isDone ? (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  )
                )}
              </span>
              <span
                className={[
                  "text-sm transition-colors duration-300",
                  isDone ? "text-zinc-400 line-through" : isActive ? "font-medium text-zinc-900" : "text-zinc-400",
                ].join(" ")}
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
