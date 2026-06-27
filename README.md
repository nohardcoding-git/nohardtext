# NoHardText

**Never ship hardcoded UI strings again.**

NoHardText is a localization quality tool for modern frontend projects.

It detects hardcoded user-facing text in React/TSX code and reports localization issues before they reach production.

---

## Status

Release candidate preparation.

NoHardText currently supports:

- React / TSX scanning
- CLI usage
- JSON reports
- GitHub Actions annotation output
- CI failure thresholds
- Config validation
- Rule enable/disable config
- Rule severity overrides
- Custom component text prop detection
- Localization health score
- Release safety checks
- Package pack checks

---

## Why NoHardText?

Babel can parse code.

NoHardText understands localization quality.

It helps answer:

> Can I ship this release without hardcoded user-facing text?

---

## Current Rules

| Rule ID | Rule | Category | Default Severity | Description |
|---|---|---|---|---|
| NHT1001 | JSX Text | localization | high | Detects hardcoded user-facing text inside JSX nodes |
| NHT1002 | Placeholder Attribute | localization | high | Detects hardcoded placeholder attribute values |
| NHT1003 | Title Attribute | localization | high | Detects hardcoded title attribute values |
| NHT1004 | ARIA Label | accessibility | high | Detects hardcoded aria-label attribute values |
| NHT1005 | Alt Attribute | accessibility | high | Detects hardcoded image alt text |
| NHT1006 | Component Text Prop | localization | high | Detects hardcoded text passed through common custom component props |

---

## Quick Start

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Run the CLI demo:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src
```

---

## CLI Usage

### Scan a path

```bash
node packages/cli/dist/index.js scan src
```

### Scan the example project

```bash
node packages/cli/dist/index.js scan examples/react-basic/src
```

### Print JSON output

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --json
```

### Write JSON output to a file

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --json --output nohardtext-report.json
```

### Print GitHub Actions annotations

```bash
node packages/cli/dist/index.js scan src --github-annotations --fail-on high
```

### Write GitHub Actions annotations to a file

```bash
node packages/cli/dist/index.js scan src --github-annotations --output github-annotations.txt
```

### Fail CI on a severity threshold

```bash
node packages/cli/dist/index.js scan src --fail-on high
```

Allowed severities:

- info
- low
- medium
- high
- critical

CLI flags take priority over config.

### List supported rules

```bash
node packages/cli/dist/index.js rules
```

### Show help

```bash
node packages/cli/dist/index.js --help
```

### Show version

```bash
node packages/cli/dist/index.js --version
```

---

## Example Human Output

```txt
NoHardText CLI

Scanned files: 1
Findings: 6
Can I ship? No
Reason: 6 high-severity localization findings found.
Localization grade: F
Localization score: 28 / 100

Top issues:
  NHT1001 - JSX Text: 2 findings (high, localization)
    Example: Hardcoded JSX text found: "Welcome"

Rule breakdown:
  NHT1001 - JSX Text: 2 findings
  NHT1002 - Placeholder Attribute: 1 finding
  NHT1003 - Title Attribute: 1 finding
  NHT1004 - ARIA Label: 1 finding
  NHT1005 - Alt Attribute: 1 finding

Category breakdown:
  localization: 4 findings
  accessibility: 2 findings
```

---

## JSON Report

```bash
node packages/cli/dist/index.js scan src --json --output nohardtext-report.json
```

The JSON report includes:

- schema version
- generation time
- tool metadata
- scanned file count
- scanned files
- findings
- severity summary
- rule breakdown
- category breakdown
- top issues
- localization health score
- ship decision
- CI metadata

See:

```txt
docs/engineering/JSON_REPORT_SPEC.md
docs/engineering/REPORTING_ENGINE_SPEC.md
```

---

## GitHub Actions

NoHardText can emit GitHub Actions annotation syntax:

```bash
node packages/cli/dist/index.js scan src --github-annotations --fail-on high
```

Example annotation:

```txt
::error file=src/App.tsx,line=4,col=11,title=NHT1001 - JSX Text::[high][localization] Hardcoded JSX text found: "Welcome"
```

See:

```txt
docs/engineering/GITHUB_ACTIONS_SPEC.md
```

---

## Configuration

NoHardText supports a root config file:

```txt
nohardtext.config.json
```

Example:

```json
{
  "ignore": [
    "storybook-static"
  ],
  "failOn": "high",
  "componentTextProps": [
    "message",
    "text"
  ],
  "rules": {
    "NHT1001": "high",
    "NHT1002": "medium",
    "NHT1003": "off"
  }
}
```

### ignore

Additional directories to skip during scan.

Built-in ignored directories include:

- node_modules
- dist
- coverage
- .git
- .next
- build
- out

### failOn

Default CI failure threshold.

Example:

```json
{
  "failOn": "high"
}
```

### componentTextProps

Additional custom component prop names that should be checked for hardcoded user-facing text.

Example:

```json
{
  "componentTextProps": [
    "message",
    "text"
  ]
}
```

This detects:

```tsx
<Toast message="Saved successfully" />
<Badge text="New" />
```

These props are checked only on custom components, not native HTML elements.

### rules

Rules can be disabled or have their severity overridden.

```json
{
  "rules": {
    "NHT1001": "off",
    "NHT1002": "medium"
  }
}
```

Supported values:

- off
- info
- low
- medium
- high
- critical

See:

```txt
docs/engineering/CONFIG_SPEC.md
docs/engineering/RULE_CONFIG_SPEC.md
```

---

## Example Project

The example project intentionally contains hardcoded text so the CLI has something to detect.

```bash
node packages/cli/dist/index.js scan examples/react-basic/src
```

Current example patterns include:

```tsx
<h1>Welcome</h1>
<button title="Start the game" aria-label="Start button">
  Start Game
</button>
<input placeholder="Search..." />
<img src="/logo.png" alt="Game logo" />
```

---

## Development

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Run type checks:

```bash
pnpm typecheck
```

Run tests:

```bash
pnpm test
```

Run release safety checks:

```bash
pnpm release:check
pnpm release:pack
```

---

## Release Checks

### release:check

```bash
pnpm release:check
```

Validates:

- build
- tests
- CLI help
- CLI version
- JSON output
- GitHub annotation output
- dirty fixture detection
- clean fixture with localization call

### release:pack

```bash
pnpm release:pack
```

Validates:

- package metadata
- dist output
- types output
- files allowlist
- CLI bin metadata
- package packing

See:

```txt
docs/engineering/RELEASE_CHECKS_SPEC.md
docs/engineering/FIRST_RELEASE_CANDIDATE_CHECKLIST.md
```

---

## Packages

```txt
packages/
  cli/
  detect-engine/
  domain/
  parser/
  report-engine/
  rule-engine/
```

### @nohardcoding/nohardtext-domain

Shared domain types.

### @nohardcoding/nohardtext-parser

Parser utilities for JSX and TypeScript source.

### @nohardcoding/nohardtext-rule-engine

Rule execution helpers.

### @nohardcoding/nohardtext-detect-engine

Built-in detection rules.

### @nohardcoding/nohardtext-report-engine

Summary, health score, ship decision, breakdowns, and top issues.

### @nohardcoding/nohardtext

Command-line interface.

---

## Sprint Status

Sprint 0 — Foundation: Done  
Sprint 1 — Hello World Scan: Done  
Sprint 2 — Rule System Cleanup: Done  
Sprint 3 — Real-world Detection: Done  
Sprint 4 — Config System: Done  
Sprint 5 — CLI & CI Polish: Done  
Sprint 6 — Reporting Engine Polish: Done  
Sprint 7 — Developer Experience & Package Polish: Done  
Sprint 8 — README, Examples & First Release Candidate: In progress

---

## Product Direction

NoHardText is designed to become the ESLint of localization quality.

Planned future work:

- stronger real-world detection
- broader framework support
- auto-fix
- VS Code extension
- MCP server
- hosted reporting
- team dashboards
- release trend reports

---

## License

TBD
