import type { OnboardingStep } from "@/types/audit";

const verdictConfig = {
  good: {
    label: "Good",
    chip: "bg-[#d1fae5] text-[#065f46] border border-[#10b981]",
    dot: "bg-[#10b981]",
    line: "border-[#10b981]",
  },
  "needs-work": {
    label: "Needs work",
    chip: "bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]",
    dot: "bg-[#f59e0b]",
    line: "border-[#f59e0b]",
  },
  issue: {
    label: "Issue",
    chip: "bg-[#fee2e2] text-[#991b1b] border border-[#dc2626]",
    dot: "bg-[#dc2626]",
    line: "border-[#dc2626]",
  },
};

export default function FlowTimeline({ steps }: { steps: OnboardingStep[] }) {
  return (
    <ol className="relative space-y-6">
      {steps.map((step, i) => {
        const config = verdictConfig[step.verdict];
        const isLast = i === steps.length - 1;
        return (
          <li key={step.name} className="flex gap-4">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <span className={`mt-1.5 h-4 w-4 flex-shrink-0 ring-4 ring-white ${config.dot}`} />
              {!isLast && (
                <span
                  className={`mt-2 flex-1 border-l-2 border-dashed w-px ${config.line}`}
                  style={{ minHeight: "80px" }}
                />
              )}
            </div>

            {/* Step content */}
            <div className="pb-4 min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#1f2937]">{step.name}</p>
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${config.chip}`}>
                  {config.label}
                </span>
              </div>

              {step.screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={step.screenshotUrl}
                  alt={step.name}
                  className="w-full max-w-sm border-2 border-[#e5e7eb] object-cover object-top"
                  style={{ height: 120 }}
                />
              ) : (
                <div className="flex aspect-video w-full max-w-sm items-center justify-center border-2 border-[#e5e7eb] bg-[#f5f5f5]">
                  <svg className="h-6 w-6 text-[#d1d5db]" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {step.notes && (
                <p className="text-sm text-[#6b7280]">{step.notes}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
