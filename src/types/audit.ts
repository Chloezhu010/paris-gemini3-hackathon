// ── Screenshots ──────────────────────────────────────────────────────────────

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

// ── User Flow ─────────────────────────────────────────────────────────────────

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

// ── Main Report ───────────────────────────────────────────────────────────────

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

// ── API Response ──────────────────────────────────────────────────────────────

export type DesignResponse = {
  report: DesignReport;
  screenshots: DesignScreenshots;
};
