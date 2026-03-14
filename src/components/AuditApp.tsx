"use client";

import { useState } from "react";
import type { AuditIssue, AuditReport, OnboardingStep } from "@/types/audit";
import ProgressSteps from "@/components/ProgressSteps";
import FlowTimeline from "@/components/FlowTimeline";

function severityLabel(severity: AuditIssue["severity"]) {
  switch (severity) {
    case 5: return "Critical";
    case 4: return "High";
    case 3: return "Medium";
    case 2: return "Low";
    case 1: return "Nit";
  }
}

function severityClass(severity: AuditIssue["severity"]) {
  switch (severity) {
    case 5: return "bg-red-500/10 text-red-700 ring-red-500/20";
    case 4: return "bg-orange-500/10 text-orange-700 ring-orange-500/20";
    case 3: return "bg-yellow-500/10 text-yellow-800 ring-yellow-500/20";
    case 2: return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
    case 1: return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20";
  }
}

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
  const [report, setReport] = useState<AuditReport | null>(null);
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
        report: AuditReport;
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
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
              Onboarding Flow Analyzer
              <span className="h-1 w-1 rounded-full bg-zinc-400" />
              Gemini-powered
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Analyze any onboarding flow
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-600">
              Paste a URL. The agent navigates landing page → signup CTA → auth
              screen, screenshots each step, and returns a structured UX report.
            </p>
          </div>
          <div className="text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">Output:</span> flow steps + issues + quick wins
          </div>
        </header>

        <main className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Input panel */}
          <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">
                  Website URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                  placeholder="https://example.com"
                  className="h-11 w-full rounded-xl bg-white px-4 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  inputMode="url"
                  autoComplete="url"
                />
                <p className="text-xs text-zinc-500">
                  The agent will follow the signup flow automatically — no credentials needed.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || status === "loading"}
                  className={[
                    "h-11 rounded-xl px-5 text-sm font-medium transition",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                    !canSubmit || status === "loading"
                      ? "bg-zinc-200 text-zinc-500"
                      : "bg-zinc-950 text-white hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {status === "loading" ? "Analyzing…" : "Analyze onboarding flow"}
                </button>

                {status === "success" && (
                  <button
                    type="button"
                    onClick={submit}
                    className="h-11 rounded-xl px-4 text-sm font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 transition"
                  >
                    Regenerate
                  </button>
                )}
              </div>

              {status === "error" && error ? (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-inset ring-red-200">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          {/* Report panel */}
          <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                  Onboarding report
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Flow steps, issues, and quick wins will appear here.
                </p>
              </div>
              {report ? (
                <div className="text-right text-xs text-zinc-500">
                  Generated {formatIso(report.generatedAt)}
                </div>
              ) : null}
            </div>

            {status === "loading" ? (
              <div className="mt-6">
                <ProgressSteps />
              </div>
            ) : !report ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white p-6">
                <p className="text-sm font-medium text-zinc-900">
                  Run an analysis to see results here.
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  You'll get a flow walkthrough, issue breakdown, and quick wins.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["Score", "Issues", "Quick wins"].map((label) => (
                    <div key={label} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                      <p className="text-xs font-medium text-zinc-700">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-zinc-950">—</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Flow timeline */}
                {onboardingSteps && onboardingSteps.length > 0 ? (
                  <FlowTimeline steps={onboardingSteps} />
                ) : null}

                {/* Scorecard */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">Friction score</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                      {report.score}/100
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">Goal</p>
                    <p className="mt-2 text-sm font-medium text-zinc-950">
                      {report.primaryGoal}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">Product</p>
                    <p className="mt-2 text-sm font-medium text-zinc-950">
                      {report.productGuess}
                    </p>
                  </div>
                </div>

                {/* Issues */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-950">Top issues</h3>
                  <div className="space-y-3">
                    {report.issues.map((issue) => (
                      <div
                        key={issue.title}
                        className="rounded-2xl bg-white p-4 ring-1 ring-inset ring-zinc-200"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-950">{issue.title}</p>
                          <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", severityClass(issue.severity)].join(" ")}>
                            {severityLabel(issue.severity)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-600">
                          <span className="font-medium text-zinc-900">Evidence: </span>
                          {issue.evidence}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                          <span className="font-medium text-zinc-900">Fix: </span>
                          {issue.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick wins */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-950">Quick wins</h3>
                  <ul className="space-y-2 text-sm text-zinc-700">
                    {report.quickWins.map((item) => (
                      <li key={item} className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-inset ring-zinc-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
