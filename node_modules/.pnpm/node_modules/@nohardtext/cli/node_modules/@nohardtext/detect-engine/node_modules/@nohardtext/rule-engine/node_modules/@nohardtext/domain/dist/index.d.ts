type Severity = "critical" | "high" | "medium" | "low" | "info";
type Category = "localization" | "accessibility" | "ux" | "seo" | "developer-experience";
interface SourceLocation {
    filePath: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
interface Suggestion {
    message: string;
}
interface Fix {
    description: string;
    safe: boolean;
}
interface Finding {
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
interface ScanResult {
    findings: Finding[];
}
interface HealthScore {
    score: number;
    grade: "AAA" | "AA" | "A" | "B" | "C" | "D" | "F";
}

export type { Category, Finding, Fix, HealthScore, ScanResult, Severity, SourceLocation, Suggestion };
