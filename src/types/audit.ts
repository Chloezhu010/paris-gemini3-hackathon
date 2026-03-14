// ── Audit Core ────────────────────────────────────────────────────────────────

export type AuditIssue = {
  title: string;
  severity: 1 | 2 | 3 | 4 | 5;
  evidence: string;
  recommendation: string;
};

export type AuditReport = {
  generatedAt: string;
  productGuess: string;
  primaryGoal: string;
  score: number;
  quickWins: string[];
  issues: AuditIssue[];
};

export type AuditScreenshots = {
  desktop: string; // base64 data URI
  mobile: string;  // base64 data URI
};

// ── Onboarding Flow Steps ─────────────────────────────────────────────────────
// Each step is a browser-captured moment during the signup flow navigation.

export type OnboardingStep = {
  name: string;          // e.g. "Landing page", "Clicked: Get Started"
  screenshotUrl: string; // base64 data URI or empty string for mock
  verdict: "good" | "needs-work" | "issue";
  notes: string;         // short Gemini observation for this step
};

// ── Screenshots (desktop + mobile pair) ───────────────────────────────────────

export type DesignScreenshots = {
  desktop: string; // base64 data URI
  mobile: string;  // base64 data URI
};

// ── Design Language ───────────────────────────────────────────────────────────

export type DesignColor = {
  hex: string;    // e.g. "#E1306C"
  usage: string;  // e.g. "primary CTA"
};

export type DesignTypography = {
  headlineFont: string;
  headlineSize: number;
  bodyFont: string;
  bodySize: number;
};

export type DesignLanguage = {
  colors: DesignColor[];
  typography: DesignTypography;
  components: string[];       // e.g. ["floating action button", "bottom sheet modal"]
  animationVibe: string;      // e.g. "snappy transitions, immersive fullscreen"
};

// ── User Flow (abstract action steps, used in DesignReport) ───────────────────

export type FlowStep = {
  step: number;
  action: string;           // e.g. "User taps + button"
  decisionPoint: boolean;
};

// ── Design Decisions ──────────────────────────────────────────────────────────

export type DesignDecision = {
  question: string;   // e.g. "Why full-screen editing?"
  answer: string;     // e.g. "Increases creative freedom"
};

// ── Design Report (full competitor/design analysis) ───────────────────────────

export type DesignReport = {
  generatedAt: string;
  name: string;           // product / page name
  url: string;
  userFlow: string;       // short prose description of the overall flow
  userFlowSteps: FlowStep[];
  designLanguage: DesignLanguage;
  designDecisions: DesignDecision[];
  vibeKeywords: string[]; // 3–5 adjectives, e.g. ["vibrant", "youthful", "instant"]
};

// ── API Responses ─────────────────────────────────────────────────────────────

export type AuditResponse = {
  report: AuditReport;
  screenshots?: AuditScreenshots;
  onboardingSteps?: OnboardingStep[];
};

export type DesignResponse = {
  report: DesignReport;
  screenshots: DesignScreenshots;
};
