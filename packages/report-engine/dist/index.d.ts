import { Finding, HealthScore, ScanResult } from '@nohardcoding/nohardtext-domain';

type ShipDecision = "yes" | "warning" | "no";
interface BreakdownSummary {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
}
type RuleBreakdown = Record<string, BreakdownSummary>;
type CategoryBreakdown = Record<string, BreakdownSummary>;
interface TopIssueSummary {
    ruleId: string;
    category: Finding["category"];
    severity: Finding["severity"];
    totalFindings: number;
    exampleMessage: string;
}
interface ReportSummary {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    ruleBreakdown: RuleBreakdown;
    categoryBreakdown: CategoryBreakdown;
    topIssues: TopIssueSummary[];
    healthScore: HealthScore;
    shipDecision: ShipDecision;
    shipReason: string;
}
declare function createReportSummary(result: ScanResult): ReportSummary;

export { type BreakdownSummary, type CategoryBreakdown, type ReportSummary, type RuleBreakdown, type ShipDecision, type TopIssueSummary, createReportSummary };
