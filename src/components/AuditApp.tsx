"use client";

import { useState } from "react";
import type { AgentEvent, DesignReport, DesignScreenshots, FlowStepCapture, OnboardingStep } from "@/types/audit";
import { Button } from "@/components/ui/Button";
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

function eventLabel(e: AgentEvent): string | null {
  switch (e.type) {
    case "navigating":
      try { return `Navigating to ${new URL(e.url).hostname}…`; } catch { return `Navigating…`; }
    case "screenshot_taken":
      return `Captured: ${e.name}`;
    case "agent_thinking":
      return "Gemini deciding next action…";
    case "agent_action":
      if (e.tool === "click_text") return `Clicking "${e.args.text as string}"`;
      if (e.tool === "scroll_page") return "Scrolling page";
      return e.tool;
    case "agent_done":
      return e.reason ? `Done — ${e.reason}` : "Flow captured";
    case "analysis_start":
      return "Analyzing design with Gemini…";
    default:
      return null;
  }
}

function captureToOnboardingStep(capture: FlowStepCapture): OnboardingStep {
  return {
    name: capture.name,
    screenshotUrl: capture.dataUri,
    verdict: "good",
    notes: "",
  };
}

export default function AuditApp() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DesignReport | null>(null);
  const [screenshots, setScreenshots] = useState<DesignScreenshots | null>(null);
  const [flowStepCaptures, setFlowStepCaptures] = useState<FlowStepCapture[]>([]);
  const [agentLog, setAgentLog] = useState<AgentEvent[]>([]);

  const canSubmit = url.trim().length > 0;

  async function submit() {
    setStatus("loading");
    setError(null);
    setReport(null);
    setScreenshots(null);
    setFlowStepCaptures([]);
    setAgentLog([]);

    let response: Response;
    try {
      response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Network error");
      return;
    }

    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => null);
      setStatus("error");
      setError((data as { error?: string } | null)?.error ?? `Request failed: ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completed = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as AgentEvent;

          if (event.type === "done") {
            completed = true;
            setReport(event.report);
            setScreenshots(event.screenshots);
            setFlowStepCaptures(event.flowStepCaptures);
            setStatus("success");
          } else if (event.type === "error") {
            completed = true;
            setError(event.message);
            setStatus("error");
          } else {
            setAgentLog((prev) => [...prev, event]);
          }
        }
      }
    } catch (e) {
      if (!completed) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Stream error");
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Header */}
        <header className="mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#6d28d9] font-semibold">Gemini-powered</p>
          <h1 className="text-4xl font-bold text-[#1f2937]">Vibe Check</h1>
          <p className="text-lg text-[#6b7280] max-w-xl">
            Analyze any onboarding flow. The agent captures the page, extracts its design language, and maps the user journey automatically.
          </p>
        </header>

        <main className="space-y-6">
          {/* Input panel */}
          <section className="border-2 border-[#e5e7eb] bg-white p-8 animate-slide-in">
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-[#6b7280] font-semibold">
                Target URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 border-2 border-[#e5e7eb] bg-white transition-colors focus-within:border-[#6d28d9]">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                    placeholder="https://example.com"
                    className="input-base"
                    inputMode="url"
                    autoComplete="url"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={submit}
                  disabled={!canSubmit || status === "loading"}
                  className="flex-shrink-0"
                >
                  {status === "loading" ? "Scanning…" : "Scan"}
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
              <p className="text-xs text-[#9ca3af]">
                The agent follows the signup flow automatically — no credentials needed.
              </p>
            </div>

            {status === "error" && error ? (
              <div className="mt-4 border-l-4 border-[#dc2626] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b] font-mono animate-slide-in">
                ⚠ {error}
              </div>
            ) : null}
          </section>

          {/* Loading state */}
          {status === "loading" ? (
            <section className="border-2 border-[#e5e7eb] bg-white p-8 animate-slide-in">
              <ProgressSteps />

              {/* Live agent log */}
              {agentLog.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
                  <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold mb-3">Live events</p>
                  <ul className="space-y-2">
                    {agentLog.map((e, i) => {
                      const label = eventLabel(e);
                      if (!label) return null;
                      const isLast = i === agentLog.length - 1;
                      return (
                        <li key={i} className="flex items-center gap-2.5 text-xs font-mono">
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 ${isLast ? "bg-[#6d28d9] animate-pulse" : "bg-[#d1d5db]"}`}
                          />
                          <span className={isLast ? "text-[#1f2937]" : "text-[#9ca3af]"}>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          ) : report ? (
            <section className="border-2 border-[#e5e7eb] bg-white p-8 space-y-10 animate-slide-in">

              {/* Report header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1f2937]">{report.name}</h2>
                  <p className="mt-1 text-xs text-[#9ca3af] font-mono">
                    {formatIso(report.generatedAt)} · {report.url}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {report.vibeKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="badge-primary inline-flex items-center px-2.5 py-1 text-xs font-semibold"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent journey as FlowTimeline */}
              {flowStepCaptures.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1f2937]">Agent Journey</h3>
                    <span className="badge-secondary inline-flex items-center px-2 py-0.5 text-xs font-semibold">
                      {flowStepCaptures.length} step{flowStepCaptures.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <FlowTimeline steps={flowStepCaptures.map(captureToOnboardingStep)} />
                  {/* Mobile screenshot */}
                  {screenshots && (
                    <div className="pt-4 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-[#6b7280] font-semibold">Mobile</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshots.mobile}
                        alt="Mobile landing"
                        className="w-32 border-2 border-[#e5e7eb] object-cover object-top"
                        style={{ height: 120 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* User flow */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1f2937]">User Flow</h3>
                <p className="text-sm text-[#6b7280]">{report.userFlow}</p>
                <ol className="space-y-3">
                  {report.userFlowSteps.map((s) => (
                    <li key={s.step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center bg-[#6d28d9] text-xs font-bold text-white">
                        {s.step}
                      </span>
                      <span className="text-sm text-[#374151]">
                        {s.action}
                        {s.decisionPoint && (
                          <span className="ml-2 badge-accent inline-flex items-center px-2 py-0.5 text-xs font-semibold">
                            Decision
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Design language */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1f2937]">Design Language</h3>

                {/* Colors */}
                <div className="space-y-2">
                  <p className="text-caption">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {report.designLanguage.colors.map((c) => (
                      <div key={c.hex} className="flex items-center gap-2 border-2 border-[#e5e7eb] px-3 py-2">
                        <span
                          className="h-4 w-4 flex-shrink-0 ring-1 ring-inset ring-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-mono text-[#374151]">{c.hex}</span>
                        <span className="text-xs text-[#9ca3af]">{c.usage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-2">
                  <p className="text-caption">Typography</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-[#e5e7eb] px-4 py-3">
                      <p className="text-xs text-[#9ca3af]">Headline</p>
                      <p className="mt-1 text-sm font-semibold text-[#1f2937]">{report.designLanguage.typography.headlineFont}</p>
                      <p className="text-xs text-[#9ca3af] font-mono">{report.designLanguage.typography.headlineSize}px</p>
                    </div>
                    <div className="border-2 border-[#e5e7eb] px-4 py-3">
                      <p className="text-xs text-[#9ca3af]">Body</p>
                      <p className="mt-1 text-sm font-semibold text-[#1f2937]">{report.designLanguage.typography.bodyFont}</p>
                      <p className="text-xs text-[#9ca3af] font-mono">{report.designLanguage.typography.bodySize}px</p>
                    </div>
                  </div>
                </div>

                {/* Components + animation vibe */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-caption">Components</p>
                    <ul className="space-y-1">
                      {report.designLanguage.components.map((c) => (
                        <li key={c} className="text-sm text-[#374151] flex items-center gap-2">
                          <span className="h-1 w-1 bg-[#6d28d9]" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-caption">Animation vibe</p>
                    <p className="text-sm text-[#374151]">{report.designLanguage.animationVibe}</p>
                  </div>
                </div>
              </div>

              {/* Design decisions */}
              {report.designDecisions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1f2937]">Design Decisions</h3>
                  <div className="space-y-3">
                    {report.designDecisions.map((d) => (
                      <div key={d.question} className="border-l-4 border-[#6d28d9] bg-[#ede9fe] px-4 py-3">
                        <p className="text-sm font-semibold text-[#1f2937]">{d.question}</p>
                        <p className="mt-1 text-sm text-[#374151]">{d.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent trace (collapsible) */}
              {agentLog.length > 0 && (
                <details className="border-2 border-[#e5e7eb]">
                  <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#6b7280] hover:bg-[#f5f5f5] transition list-none flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-[#d1d5db]" />
                    Agent trace · {agentLog.length} events
                  </summary>
                  <ul className="border-t border-[#e5e7eb] px-4 py-3 space-y-1.5">
                    {agentLog.map((e, i) => {
                      const label = eventLabel(e);
                      if (!label) return null;
                      return (
                        <li key={i} className="flex items-center gap-2 text-xs text-[#9ca3af] font-mono">
                          <span className="h-1 w-1 flex-shrink-0 bg-[#e5e7eb]" />
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
