# Reporting Engine Spec

## Purpose

The reporting engine turns raw NoHardText findings into a summary that can be used by the CLI, JSON reports, CI pipelines, dashboards, and future integrations.

## Input

The reporting engine receives a scan result:

```ts
interface ScanResult {
  findings: Finding[];
}
```

## Output

`createReportSummary()` returns:

```ts
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
  shipDecision: "yes" | "warning" | "no";
  shipReason: string;
}
```

## Severity Counts

The summary includes total counts for each severity:

- critical
- high
- medium
- low
- info

## Rule Breakdown

`ruleBreakdown` groups findings by rule ID.

Example:

```json
{
  "NHT1001": {
    "totalFindings": 2,
    "critical": 0,
    "high": 1,
    "medium": 1,
    "low": 0,
    "info": 0
  }
}
```

## Category Breakdown

`categoryBreakdown` groups findings by category.

Example:

```json
{
  "localization": {
    "totalFindings": 3,
    "critical": 0,
    "high": 2,
    "medium": 1,
    "low": 0,
    "info": 0
  },
  "accessibility": {
    "totalFindings": 1,
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 0,
    "info": 0
  }
}
```

## Top Issues

`topIssues` highlights repeated or important issue groups.

Each item contains:

```ts
interface TopIssueSummary {
  ruleId: string;
  category: Finding["category"];
  severity: Finding["severity"];
  totalFindings: number;
  exampleMessage: string;
}
```

Top issues are sorted by:

1. highest number of findings
2. highest severity when counts are equal

The current limit is 5.

## Health Score

The health score starts at 100 and applies penalties:

| Severity | Penalty |
|---|---:|
| critical | 25 |
| high | 12 |
| medium | 6 |
| low | 2 |
| info | 0 |

The score cannot go below 0.

## Grade

| Score | Grade |
|---:|---|
| 95–100 | AAA |
| 90–94 | AA |
| 80–89 | A |
| 70–79 | B |
| 60–69 | C |
| 50–59 | D |
| 0–49 | F |

## Ship Decision

### yes

Returned when there are no blocking findings.

### warning

Returned when only medium or low findings exist.

### no

Returned when critical or high findings exist.

## Design Notes

The reporting engine should stay deterministic and side-effect free.

It should not:

- read files
- write files
- inspect CLI args
- format terminal output
- know about GitHub Actions

Those responsibilities belong to the CLI package.
