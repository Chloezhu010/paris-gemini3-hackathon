import type { OnboardingStep } from "@/types/audit";
import ImageLightbox from "@/components/ImageLightbox";

const verdictConfig = {
  good: {
    label: "Good",
    chip: "bg-[#ede9fe] text-[#6d28d9] border border-[#6d28d9]",
    dot: "bg-[#6d28d9]",
    line: "border-[#6d28d9]",
  },
  "needs-work": {
    label: "Needs work",
    chip: "bg-[#fce7f3] text-[#ec4899] border border-[#ec4899]",
    dot: "bg-[#ec4899]",
    line: "border-[#ec4899]",
  },
  issue: {
    label: "Issue",
    chip: "bg-[#ede9fe] text-[#5b21b6] border border-[#5b21b6]",
    dot: "bg-[#5b21b6]",
    line: "border-[#5b21b6]",
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
                <ImageLightbox
                  src={step.screenshotUrl}
                  alt={step.name}
                  className="w-full max-w-sm border-2 border-[#e5e7eb]"
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
