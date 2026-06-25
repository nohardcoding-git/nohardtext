export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Category =
  | "localization"
  | "accessibility"
  | "ux"
  | "seo"
  | "developer-experience";

export interface SourceLocation {
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface Suggestion {
  message: string;
}

export interface Fix {
  description: string;
  safe: boolean;
}

export interface Finding {
  id: string;
  ruleId: string;
  severity: Severity;
  category: Category;
  message: string;
  explanation: string;
  location: SourceLocation;
  fixable: boolean;
  suggestions: Suggestion[];
  fix?: Fix;
}

export interface ScanResult {
  findings: Finding[];
}

export interface HealthScore {
  score: number;
  grade: "AAA" | "AA" | "A" | "B" | "C" | "D" | "F";
}
