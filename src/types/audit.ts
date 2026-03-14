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

export type AuditResponse = {
  report: AuditReport;
  screenshots?: AuditScreenshots;
};
