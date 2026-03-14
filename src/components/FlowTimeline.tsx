import type { OnboardingStep } from "@/types/audit";

const verdictConfig = {
  good: {
    label: "Good",
    chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    dot: "bg-emerald-500",
    line: "border-emerald-200",
  },
  "needs-work": {
    label: "Needs work",
    chip: "bg-yellow-500/10 text-yellow-800 ring-yellow-500/20",
    dot: "bg-yellow-400",
    line: "border-yellow-200",
  },
  issue: {
    label: "Issue",
    chip: "bg-red-500/10 text-red-700 ring-red-500/20",
    dot: "bg-red-500",
    line: "border-red-200",
  },
};

function ScreenshotPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-200">
      <svg className="h-6 w-6 text-zinc-300" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function FlowTimeline({ steps }: { steps: OnboardingStep[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-950">Captured flow</h3>
      <ol className="relative space-y-4">
        {steps.map((step, i) => {
          const config = verdictConfig[step.verdict];
          const isLast = i === steps.length - 1;
          return (
            <li key={step.name} className="flex gap-4">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <span className={["mt-1 h-3 w-3 flex-shrink-0 rounded-full ring-2 ring-white", config.dot].join(" ")} />
                {!isLast && (
                  <span className={["mt-1 flex-1 border-l-2 border-dashed", config.line].join(" ")} />
                )}
              </div>

              {/* Step content */}
              <div className="pb-4 min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-950">{step.name}</p>
                  <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", config.chip].join(" ")}>
                    {config.label}
                  </span>
                </div>

                <p className="text-sm text-zinc-600">{step.notes}</p>

                {step.screenshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.screenshotUrl}
                    alt={`Screenshot: ${step.name}`}
                    className="mt-2 w-full rounded-xl object-cover ring-1 ring-inset ring-zinc-200"
                  />
                ) : (
                  <ScreenshotPlaceholder />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
