"use client";

import { useEffect, useState } from "react";
import type { AuditIssue, AuditReport, AuditScreenshots } from "@/types/audit";

type InputMode = "url" | "text" | "screenshot";

function severityLabel(severity: AuditIssue["severity"]) {
  switch (severity) {
    case 5:
      return "Critical";
    case 4:
      return "High";
    case 3:
      return "Medium";
    case 2:
      return "Low";
    case 1:
      return "Nit";
  }
}

function severityClass(severity: AuditIssue["severity"]) {
  switch (severity) {
    case 5:
      return "bg-red-500/10 text-red-700 ring-red-500/20";
    case 4:
      return "bg-orange-500/10 text-orange-700 ring-orange-500/20";
    case 3:
      return "bg-yellow-500/10 text-yellow-800 ring-yellow-500/20";
    case 2:
      return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
    case 1:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20";
  }
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-10 px-3 rounded-full text-sm font-medium transition",
        "ring-1 ring-inset",
        active
          ? "bg-zinc-950 text-white ring-zinc-950"
          : "bg-white/70 text-zinc-800 ring-zinc-200 hover:bg-white",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
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
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [idea, setIdea] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [screenshots, setScreenshots] = useState<AuditScreenshots | null>(null);

  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const canSubmit =
    (mode === "url" && url.trim().length > 0) ||
    (mode === "text" && idea.trim().length > 0) ||
    (mode === "screenshot" && file !== null);

  async function submit() {
    setStatus("loading");
    setError(null);
    setReport(null);
    setScreenshots(null);

    try {
      const payload =
        mode === "url"
          ? { mode, url: url.trim() }
          : mode === "text"
            ? { mode, idea: idea.trim() }
            : { mode };

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          (data as { error?: string } | null)?.error ||
            `Request failed: ${response.status}`,
        );
      }

      const data = (await response.json()) as {
        report: AuditReport;
        screenshots?: AuditScreenshots;
      };
      setReport(data.report);
      setScreenshots(data.screenshots ?? null);
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
              UI/UX Audit Agent (MVP)
              <span className="h-1 w-1 rounded-full bg-zinc-400" />
              Gemini-powered
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Audit your UI, get actionable fixes
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-600">
              Paste a URL, describe an idea, or upload a screenshot. You’ll get a
              prioritized UI/UX report, competitor patterns, and concrete
              improvement suggestions.
            </p>
          </div>
          <div className="text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">Output:</span> scorecard
            + issues + quick wins
          </div>
        </header>

        <main className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              <ModeButton
                active={mode === "url"}
                label="URL"
                onClick={() => setMode("url")}
              />
              <ModeButton
                active={mode === "text"}
                label="Idea"
                onClick={() => setMode("text")}
              />
              <ModeButton
                active={mode === "screenshot"}
                label="Screenshot"
                onClick={() => setMode("screenshot")}
              />
            </div>

            <div className="mt-6 space-y-4">
              {mode === "url" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">
                    Website URL
                  </label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-11 w-full rounded-xl bg-white px-4 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    inputMode="url"
                    autoComplete="url"
                  />
                  <p className="text-xs text-zinc-500">
                    Tip: start with a landing page you want to improve.
                  </p>
                </div>
              ) : null}

              {mode === "text" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">
                    Describe your product / idea
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="What is it? Who is it for? What action should users take?"
                    className="min-h-32 w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                  <p className="text-xs text-zinc-500">
                    Include target users + the primary conversion goal.
                  </p>
                </div>
              ) : null}

              {mode === "screenshot" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">
                    Upload a screenshot
                  </label>
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-inset ring-zinc-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
                    />
                  </div>
                  {filePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filePreviewUrl}
                      alt="Uploaded screenshot preview"
                      className="mt-3 max-h-72 w-full rounded-2xl object-cover ring-1 ring-inset ring-zinc-200"
                    />
                  ) : null}
                  <p className="text-xs text-zinc-500">
                    For MVP we only preview the image; audit will be wired to
                    Gemini next.
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  {status === "loading" ? "Generating…" : "Generate audit"}
                </button>
                <p className="text-xs text-zinc-500">
                  Output is mock data for now (API stub).
                </p>
              </div>

              {status === "error" && error ? (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-inset ring-red-200">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-inset ring-zinc-200 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                  Report preview
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  This panel will render the structured audit output.
                </p>
              </div>
              {report ? (
                <div className="text-right text-xs text-zinc-500">
                  Generated {formatIso(report.generatedAt)}
                </div>
              ) : null}
            </div>

            {status === "loading" ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white p-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                <p className="text-sm text-zinc-500">
                  Capturing screenshots and analysing with Gemini…
                </p>
              </div>
            ) : !report ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white p-6">
                <p className="text-sm font-medium text-zinc-900">
                  Run an audit to see results here.
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  You’ll get a score, top issues, and quick wins.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">Score</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                      —
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">
                      Issues
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                      —
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">
                      Quick wins
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                      —
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {screenshots ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-950">
                      Captured screenshots
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Desktop</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screenshots.desktop}
                          alt="Desktop screenshot"
                          className="w-full rounded-xl ring-1 ring-inset ring-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Mobile</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screenshots.mobile}
                          alt="Mobile screenshot"
                          className="w-full rounded-xl ring-1 ring-inset ring-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200">
                    <p className="text-xs font-medium text-zinc-700">Score</p>
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
                    <p className="text-xs font-medium text-zinc-700">
                      Product guess
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-950">
                      {report.productGuess}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-950">
                    Top issues
                  </h3>
                  <div className="space-y-3">
                    {report.issues.map((issue) => (
                      <div
                        key={issue.title}
                        className="rounded-2xl bg-white p-4 ring-1 ring-inset ring-zinc-200"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-950">
                            {issue.title}
                          </p>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                              severityClass(issue.severity),
                            ].join(" ")}
                          >
                            {severityLabel(issue.severity)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-600">
                          <span className="font-medium text-zinc-900">
                            Evidence:
                          </span>{" "}
                          {issue.evidence}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                          <span className="font-medium text-zinc-900">
                            Recommendation:
                          </span>{" "}
                          {issue.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-950">
                    Quick wins
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-700">
                    {report.quickWins.map((item) => (
                      <li
                        key={item}
                        className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-inset ring-zinc-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-10 text-xs text-zinc-500">
          URL mode: Playwright captures screenshots → Gemini analyzes → real
          audit. Text/screenshot modes use mock data.
        </footer>
      </div>
    </div>
  );
}
