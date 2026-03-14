import type { OnboardingStep } from "@/types/audit";

const verdictConfig = {
  good: {
    label: "Good",
    chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    border: "ring-emerald-200",
  },
  "needs-work": {
    label: "Needs work",
    chip: "bg-yellow-500/10 text-yellow-800 ring-yellow-500/20",
    border: "ring-yellow-200",
  },
  issue: {
    label: "Issue",
    chip: "bg-red-500/10 text-red-700 ring-red-500/20",
    border: "ring-red-200",
  },
};

function ScreenshotPlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-200">
      <svg className="h-8 w-8 text-zinc-300" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-xs text-zinc-400">Screenshot pending</p>
    </div>
  );
}

function StepConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-3 w-px bg-zinc-200" />
      <svg className="h-4 w-4 text-zinc-300" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="h-3 w-px bg-zinc-200" />
    </div>
  );
}

export default function FlowTimeline({ steps }: { steps: OnboardingStep[] }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-zinc-950">Captured flow</h3>
      <p className="mb-3 text-xs text-zinc-500">
        Each screen captured by Playwright as the agent navigated the signup flow.
      </p>

      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const config = verdictConfig[step.verdict];
          const isLast = i === steps.length - 1;

          return (
            <li key={step.name}>
              <div className={["rounded-2xl bg-white p-4 ring-1 ring-inset", config.border].join(" ")}>
                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-zinc-950">{step.name}</p>
                  </div>
                  <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", config.chip].join(" ")}>
                    {config.label}
                  </span>
                </div>

                {/* Full-width screenshot */}
                {step.screenshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.screenshotUrl}
                    alt={`Screenshot: ${step.name}`}
                    className="w-full rounded-xl object-cover object-top ring-1 ring-inset ring-zinc-100"
                    style={{ maxHeight: "360px" }}
                  />
                ) : (
                  <ScreenshotPlaceholder />
                )}

                {/* Notes */}
                <p className="mt-3 text-sm leading-5 text-zinc-600">{step.notes}</p>
              </div>

              {!isLast && <StepConnector />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
