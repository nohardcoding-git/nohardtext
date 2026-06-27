import type { Finding, HealthScore, ScanResult } from "@nohardcoding/nohardtext-domain";

export type ShipDecision = "yes" | "warning" | "no";

export interface BreakdownSummary {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export type RuleBreakdown = Record<string, BreakdownSummary>;
export type CategoryBreakdown = Record<string, BreakdownSummary>;

export interface TopIssueSummary {
  ruleId: string;
  category: Finding["category"];
  severity: Finding["severity"];
  totalFindings: number;
  exampleMessage: string;
}

export interface ReportSummary {
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

function getGrade(score: number): HealthScore["grade"] {
  if (score >= 95) return "AAA";
  if (score >= 90) return "AA";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function createEmptyBreakdown(): BreakdownSummary {
  return {
    totalFindings: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };
}

function incrementBreakdown(
  breakdown: BreakdownSummary,
  severity: Finding["severity"]
): void {
  breakdown.totalFindings += 1;
  breakdown[severity] += 1;
}

function getRuleBreakdown(findings: Finding[]): RuleBreakdown {
  const breakdown: RuleBreakdown = {};

  for (const finding of findings) {
    let ruleSummary = breakdown[finding.ruleId];

    if (!ruleSummary) {
      ruleSummary = createEmptyBreakdown();
      breakdown[finding.ruleId] = ruleSummary;
    }

    incrementBreakdown(ruleSummary, finding.severity);
  }

  return breakdown;
}

function getCategoryBreakdown(findings: Finding[]): CategoryBreakdown {
  const breakdown: CategoryBreakdown = {};

  for (const finding of findings) {
    let categorySummary = breakdown[finding.category];

    if (!categorySummary) {
      categorySummary = createEmptyBreakdown();
      breakdown[finding.category] = categorySummary;
    }

    incrementBreakdown(categorySummary, finding.severity);
  }

  return breakdown;
}

function getSeverityRank(severity: Finding["severity"]): number {
  const order: Finding["severity"][] = [
    "info",
    "low",
    "medium",
    "high",
    "critical"
  ];

  return order.indexOf(severity);
}

function getTopIssues(findings: Finding[], limit = 5): TopIssueSummary[] {
  const groups = new Map<string, TopIssueSummary>();

  for (const finding of findings) {
    const key = [finding.ruleId, finding.category, finding.severity].join("|");
    const current = groups.get(key);

    if (current) {
      current.totalFindings += 1;
      continue;
    }

    groups.set(key, {
      ruleId: finding.ruleId,
      category: finding.category,
      severity: finding.severity,
      totalFindings: 1,
      exampleMessage: finding.message
    });
  }

  return [...groups.values()]
    .sort((left, right) => {
      if (right.totalFindings !== left.totalFindings) {
        return right.totalFindings - left.totalFindings;
      }

      return getSeverityRank(right.severity) - getSeverityRank(left.severity);
    })
    .slice(0, limit);
}

function getShipDecision(summary: {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}): { shipDecision: ShipDecision; shipReason: string } {
  if (summary.critical > 0) {
    return {
      shipDecision: "no",
      shipReason: `${summary.critical} critical localization findings found.`
    };
  }

  if (summary.high > 0) {
    return {
      shipDecision: "no",
      shipReason: `${summary.high} high-severity localization findings found.`
    };
  }

  if (summary.medium > 0 || summary.low > 0) {
    return {
      shipDecision: "warning",
      shipReason: `${summary.medium + summary.low} non-blocking localization findings found.`
    };
  }

  return {
    shipDecision: "yes",
    shipReason: "No blocking localization findings found."
  };
}

export function createReportSummary(result: ScanResult): ReportSummary {
  const count = (severity: Finding["severity"]) =>
    result.findings.filter((finding) => finding.severity === severity).length;

  const critical = count("critical");
  const high = count("high");
  const medium = count("medium");
  const low = count("low");
  const info = count("info");

  const penalty = critical * 25 + high * 12 + medium * 6 + low * 2;
  const score = Math.max(0, 100 - penalty);

  const ship = getShipDecision({
    totalFindings: result.findings.length,
    critical,
    high,
    medium,
    low
  });

  return {
    totalFindings: result.findings.length,
    critical,
    high,
    medium,
    low,
    info,
    ruleBreakdown: getRuleBreakdown(result.findings),
    categoryBreakdown: getCategoryBreakdown(result.findings),
    topIssues: getTopIssues(result.findings),
    healthScore: {
      score,
      grade: getGrade(score)
    },
    shipDecision: ship.shipDecision,
    shipReason: ship.shipReason
  };
}
