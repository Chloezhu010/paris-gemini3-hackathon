"use client";

import { useState } from "react";
import type { DesignReport, DesignScreenshots, OnboardingStep } from "@/types/audit";
import ProgressSteps from "@/components/ProgressSteps";
import FlowTimeline from "@/components/FlowTimeline";
import { Button } from "@/components/ui/Button";

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
  const [screenshots, setScreenshots] = useState<DesignScreenshots | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[] | null>(null);

  const canSubmit = url.trim().length > 0;

  async function submit() {
    setStatus("loading");
    setError(null);
    setReport(null);
    setScreenshots(null);
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
        screenshots?: DesignScreenshots;
        onboardingSteps?: OnboardingStep[];
      };
      setReport(data.report);
      setScreenshots(data.screenshots ?? null);
      setOnboardingSteps(data.onboardingSteps ?? null);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <header className="mb-12 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-[#1f2937]">Vibe Check</h1>
            <p className="text-lg text-[#6b7280]">
              Analyze any onboarding flow instantly
            </p>
            <p className="text-sm text-[#9ca3af] max-w-2xl">
              Paste a URL. Our AI captures the page, extracts its design language, and maps the user flow automatically.
            </p>
          </div>
        </header>

        <main className="space-y-8">
          {/* Input panel */}
          <section className="border-2 border-[#e5e7eb] bg-white p-8 animate-slide-in">
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Target URL</label>
              <div className="flex gap-3">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border-2 border-[#e5e7eb] bg-white text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#6d28d9] transition-colors"
                  inputMode="url"
                  autoComplete="url"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={submit}
                  disabled={!canSubmit || status === "loading"}
                  className="flex-shrink-0"
                >
                  {status === "loading" ? "..." : "Scan"}
                </Button>
                {status === "success" && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={submit}
                    className="flex-shrink-0"
                  >
                    Re-scan
                  </Button>
                )}
              </div>
            </div>

            {status === "error" && error ? (
              <div className="mt-4 border-l-4 border-[#dc2626] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b] font-mono animate-slide-in">
                ⚠ {error}
              </div>
            ) : null}
          </section>

          {/* Report panel */}
          {status === "loading" ? (
            <section className="border-2 border-[#e5e7eb] bg-white p-8 animate-slide-in">
              <ProgressSteps />
            </section>
          ) : report ? (
            <section className="space-y-8">
              {/* Header with vibe keywords */}
              <div className="border-2 border-[#e5e7eb] bg-white p-8 animate-slide-in">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1f2937]">{report.name}</h2>
                    <p className="mt-2 text-sm text-[#6b7280] font-mono">{formatIso(report.generatedAt)} · {report.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {report.vibeKeywords.map((kw) => (
                      <span key={kw} className="bg-[#ede9fe] border border-[#6d28d9] px-3 py-1.5 text-xs text-[#6d28d9] uppercase font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              {screenshots ? (
                <div className="space-y-4 animate-slide-in">
                  <h3 className="text-lg font-bold text-[#1f2937]">Captured Screenshots</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Desktop</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={screenshots.desktop} alt="Desktop screenshot" className="w-full border-2 border-[#e5e7eb] hover:border-[#6d28d9] transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Mobile</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={screenshots.mobile} alt="Mobile screenshot" className="w-full border-2 border-[#e5e7eb] hover:border-[#6d28d9] transition-colors" />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* User flow */}
              <div className="border-2 border-[#e5e7eb] bg-white p-8 space-y-6 animate-slide-in">
                <div>
                  <h3 className="text-lg font-bold text-[#1f2937] mb-4">User Flow</h3>
                  <p className="text-base text-[#4b5563] leading-7">{report.userFlow}</p>
                </div>
                <ol className="space-y-3">
                  {report.userFlowSteps.map((s) => (
                    <li key={s.step} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-white text-sm font-bold bg-[#6d28d9] border-2 border-[#6d28d9]">
                        {s.step}
                      </span>
                      <span className="text-base text-[#1f2937] pt-1">
                        {s.action}
                        {s.decisionPoint && (
                          <span className="ml-3 inline-flex items-center border-2 border-[#f59e0b] px-2.5 py-1 text-xs font-semibold text-[#f59e0b] bg-[#fef3c7]">
                            Decision Point
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Design language */}
              <div className="space-y-6 animate-slide-in">
                <h3 className="text-lg font-bold text-[#1f2937]">Design Language</h3>

                {/* Colors */}
                <div className="border-2 border-[#e5e7eb] bg-white p-8 space-y-4">
                  <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Colors</p>
                  <div className="flex flex-wrap gap-3">
                    {report.designLanguage.colors.map((c) => (
                      <div key={c.hex} className="flex items-center gap-3 border-2 border-[#e5e7eb] bg-white px-4 py-3 hover:border-[#6d28d9] transition-colors">
                        <span
                          className="h-4 w-4 flex-shrink-0 border-2 border-[#e5e7eb]"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div>
                          <p className="text-xs font-mono text-[#1f2937] font-semibold">{c.hex}</p>
                          <p className="text-xs text-[#6b7280]">{c.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="border-2 border-[#e5e7eb] bg-white p-8 space-y-4">
                  <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Typography</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-[#e5e7eb] bg-white p-4 hover:border-[#6d28d9] transition-colors">
                      <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Headline</p>
                      <p className="mt-3 text-base font-semibold text-[#1f2937]">{report.designLanguage.typography.headlineFont}</p>
                      <p className="text-xs text-[#6b7280]">{report.designLanguage.typography.headlineSize}px</p>
                    </div>
                    <div className="border-2 border-[#e5e7eb] bg-white p-4 hover:border-[#6d28d9] transition-colors">
                      <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Body</p>
                      <p className="mt-3 text-base font-semibold text-[#1f2937]">{report.designLanguage.typography.bodyFont}</p>
                      <p className="text-xs text-[#6b7280]">{report.designLanguage.typography.bodySize}px</p>
                    </div>
                  </div>
                </div>

                {/* Components + animation vibe */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-[#e5e7eb] bg-white p-8 hover:border-[#6d28d9] transition-colors space-y-3">
                    <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Components</p>
                    <ul className="space-y-2">
                      {report.designLanguage.components.map((c) => (
                        <li key={c} className="text-sm text-[#1f2937]">• {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-2 border-[#e5e7eb] bg-white p-8 hover:border-[#ec4899] transition-colors space-y-3">
                    <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Animation Vibe</p>
                    <p className="text-sm text-[#1f2937] leading-6">{report.designLanguage.animationVibe}</p>
                  </div>
                </div>
              </div>

              {/* Captured flow */}
              {onboardingSteps && onboardingSteps.length > 0 ? (
                <div className="border-2 border-[#e5e7eb] bg-white p-8 animate-slide-in">
                  <h3 className="text-lg font-bold text-[#1f2937] mb-6">Captured Flow</h3>
                  <FlowTimeline steps={onboardingSteps} />
                </div>
              ) : null}

              {/* Design decisions */}
              {report.designDecisions.length > 0 ? (
                <div className="space-y-4 animate-slide-in">
                  <h3 className="text-lg font-bold text-[#1f2937]">Design Decisions</h3>
                  <div className="space-y-3">
                    {report.designDecisions.map((d) => (
                      <div key={d.question} className="border-l-4 border-l-[#6d28d9] border-2 border-[#e5e7eb] bg-white px-6 py-4 hover:border-l-[#ec4899] transition-colors">
                        <p className="text-sm font-bold text-[#1f2937]">{d.question}</p>
                        <p className="mt-2 text-sm text-[#6b7280] leading-6">{d.answer}</p>
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
