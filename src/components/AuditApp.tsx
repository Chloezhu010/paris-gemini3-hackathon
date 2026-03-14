"use client";

import { useState } from "react";
import type { DesignReport, OnboardingStep } from "@/types/audit";
import ProgressSteps from "@/components/ProgressSteps";
import FlowTimeline from "@/components/FlowTimeline";

function formatIso(ts: string) {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return ts;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AuditApp() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DesignReport | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[] | null>(null);

  const canSubmit = url.trim().length > 0;

  async function submit() {
    setStatus("loading");
    setError(null);
    setReport(null);
    setOnboardingSteps(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          (data as { error?: string } | null)?.error ??
            `Request failed: ${response.status}`,
        );
      }

      const data = await response.json() as {
        report: DesignReport;
        onboardingSteps?: OnboardingStep[];
      };
      setReport(data.report);
      setOnboardingSteps(data.onboardingSteps ?? null);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_60rem_at_20%_10%,rgba(0,0,0,0.06),transparent_60%),radial-gradient(70rem_70rem_at_80%_0%,rgba(0,0,0,0.05),transparent_55%),linear-gradient(to_bottom,#fafafa,#ffffff)]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
            Onboarding Flow Analyzer
            <span className="h-1 w-1 rounded-full bg-zinc-400" />
            Gemini-powered
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Analyze any onboarding flow
          </h1>
          <p className="max-w-xl text-sm leading-6 text-zinc-600">
            Paste a URL. The agent captures the page, extracts its design language,
            and maps the user flow automatically.
          </p>
        </header>

        <main className="mt-8 flex flex-col gap-6">
          {/* Input panel */}
          <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur">
            <div className="flex gap-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                placeholder="https://example.com"
                className="h-11 min-w-0 flex-1 rounded-xl bg-white px-4 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                inputMode="url"
                autoComplete="url"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || status === "loading"}
                className={[
                  "h-11 flex-shrink-0 rounded-xl px-5 text-sm font-medium transition",
                  "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                  !canSubmit || status === "loading"
                    ? "bg-zinc-200 text-zinc-500"
                    : "bg-zinc-950 text-white hover:bg-zinc-800",
                ].join(" ")}
              >
                {status === "loading" ? "Analyzing…" : "Analyze"}
              </button>
              {status === "success" && (
                <button
                  type="button"
                  onClick={submit}
                  className="h-11 flex-shrink-0 rounded-xl px-4 text-sm font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 transition"
                >
                  Regenerate
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              The agent follows the signup flow automatically — no credentials needed.
            </p>

            {status === "error" && error ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-inset ring-red-200">
                {error}
              </div>
            ) : null}
          </section>

          {/* Report panel */}
          {status === "loading" ? (
            <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur">
              <ProgressSteps />
            </section>
          ) : report ? (
            <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-950">{report.name}</h2>
                  <p className="mt-1 text-xs text-zinc-400">{formatIso(report.generatedAt)} · {report.url}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {report.vibeKeywords.map((kw) => (
                    <span key={kw} className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Flow timeline */}
              {onboardingSteps && onboardingSteps.length > 0 ? (
                <FlowTimeline steps={onboardingSteps} />
              ) : null}

              {/* User flow */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-950">User flow</h3>
                <p className="text-sm leading-6 text-zinc-600">{report.userFlow}</p>
                <ol className="space-y-2">
                  {report.userFlowSteps.map((s) => (
                    <li key={s.step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 ring-1 ring-inset ring-zinc-200">
                        {s.step}
                      </span>
                      <span className="text-sm text-zinc-700">
                        {s.action}
                        {s.decisionPoint && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                            Decision point
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Design language */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-950">Design language</h3>

                {/* Colors */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {report.designLanguage.colors.map((c) => (
                      <div key={c.hex} className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-inset ring-zinc-200">
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-mono text-zinc-700">{c.hex}</span>
                        <span className="text-xs text-zinc-500">{c.usage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Typography</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-inset ring-zinc-200">
                      <p className="text-xs text-zinc-500">Headline</p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{report.designLanguage.typography.headlineFont}</p>
                      <p className="text-xs text-zinc-500">{report.designLanguage.typography.headlineSize}px</p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-inset ring-zinc-200">
                      <p className="text-xs text-zinc-500">Body</p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{report.designLanguage.typography.bodyFont}</p>
                      <p className="text-xs text-zinc-500">{report.designLanguage.typography.bodySize}px</p>
                    </div>
                  </div>
                </div>

                {/* Components + animation vibe */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Components</p>
                    <ul className="space-y-1">
                      {report.designLanguage.components.map((c) => (
                        <li key={c} className="text-sm text-zinc-700">· {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Animation vibe</p>
                    <p className="text-sm text-zinc-700">{report.designLanguage.animationVibe}</p>
                  </div>
                </div>
              </div>

              {/* Design decisions */}
              {report.designDecisions.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-950">Design decisions</h3>
                  <div className="space-y-3">
                    {report.designDecisions.map((d) => (
                      <div key={d.question} className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-inset ring-zinc-200">
                        <p className="text-sm font-medium text-zinc-900">{d.question}</p>
                        <p className="mt-1 text-sm text-zinc-600">{d.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
