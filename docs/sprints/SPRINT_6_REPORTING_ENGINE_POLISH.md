# Sprint 6 — Reporting Engine Polish

## Status

Done.

## Goal

Improve NoHardText reporting so scan results are easier to understand in JSON reports, CLI output, CI pipelines, and future dashboards.

## Completed

- Added rule-level breakdowns to report summaries.
- Added category-level breakdowns to report summaries.
- Added top issues summary to highlight the most important repeated problems.
- Added report-engine tests for rule breakdowns, category breakdowns, top issues, warning decisions, and empty reports.
- Updated human CLI scan output to show:
  - Top issues
  - Rule breakdown
  - Category breakdown
- Kept JSON output backward-compatible while adding more useful report metadata.

## Report Summary Additions

The report summary now includes:

```json
{
  "ruleBreakdown": {
    "NHT1001": {
      "totalFindings": 2,
      "critical": 0,
      "high": 1,
      "medium": 1,
      "low": 0,
      "info": 0
    }
  },
  "categoryBreakdown": {
    "localization": {
      "totalFindings": 2,
      "critical": 0,
      "high": 1,
      "medium": 1,
      "low": 0,
      "info": 0
    }
  },
  "topIssues": [
    {
      "ruleId": "NHT1001",
      "category": "localization",
      "severity": "high",
      "totalFindings": 2,
      "exampleMessage": "Hardcoded JSX text found."
    }
  ]
}
```

## Human CLI Output

The CLI now includes a clearer reporting section:

```txt
Top issues:
  NHT1001 - JSX Text: 3 findings (high, localization)
    Example: Hardcoded JSX text found: "Welcome"

Rule breakdown:
  NHT1001 - JSX Text: 3 findings
  NHT1002 - Placeholder Attribute: 1 finding

Category breakdown:
  localization: 3 findings
  accessibility: 1 finding
```

## Why This Matters

This sprint makes NoHardText more useful outside local CLI scans.

The same report data can now support:

- terminal summaries
- GitHub Actions logs
- JSON artifacts
- dashboards
- VS Code extension UI
- MCP server responses
- future hosted reporting

## Acceptance Criteria

- Report engine tests pass.
- CLI tests pass.
- Full monorepo build passes.
- Full monorepo test suite passes.
- JSON output includes breakdowns and top issues.
- Human output remains readable and stable.

## Next Sprint

Sprint 7 — Developer Experience and Package Polish.

Focus:

- npm package metadata
- README usage polish
- example project cleanup
- release readiness checklist
- command examples
- final CLI behavior review
