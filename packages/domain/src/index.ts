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
  /**
   * The raw detected text or literal value, when the finding is about a
   * specific string. Optional for backward compatibility with existing
   * rule output, but should be populated by any rule that detects a
   * concrete value — cross-cutting rules (e.g. cross-file duplicate
   * detection) depend on this being structured data rather than something
   * parsed back out of `message`.
   */
  value?: string;
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

export interface RuleMetadata {
  id: string;
  name: string;
  category: Category;
  severity: Severity;
  description: string;
  fixable: boolean;
}
