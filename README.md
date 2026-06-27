# NoHardText

**Never ship hardcoded UI strings again.**

NoHardText is a localization quality tool for modern frontend projects.

It detects hardcoded user-facing text in React/TSX code and reports localization issues before they reach production.

---

## Status

Early prototype.

Current focus:

- React / TSX detection
- CLI scanning
- Rule metadata
- Localization score
- "Can I ship?" release confidence
- JSON reports
- CI failure threshold
- Lightweight config support
- Real-world React detection

---

## Why NoHardText?

Babel can parse code.

NoHardText understands localization quality.

It helps answer:

> Can I ship this release without hardcoded user-facing text?

---

## Current Rules

| Rule ID | Rule | Category | Severity | Description |
|---|---|---|---|---|
| NHT1001 | JSX Text | localization | high | Detects hardcoded user-facing text inside JSX nodes |
| NHT1002 | Placeholder Attribute | localization | high | Detects hardcoded placeholder attribute values |
| NHT1003 | Title Attribute | localization | high | Detects hardcoded title attribute values |
| NHT1004 | ARIA Label | accessibility | high | Detects hardcoded aria-label attribute values |
| NHT1005 | Alt Attribute | accessibility | high | Detects hardcoded image alt text |
| NHT1006 | Component Text Prop | localization | high | Detects hardcoded text passed through common custom component props |

---

## CLI Demo

```bash
node packages/cli/dist/index.js scan examples/react-basic/src
```

Example output:

```txt
NoHardText CLI

Scanned files: 1
Findings: 6
Can I ship? No
Reason: 6 high-severity localization findings found.
Localization grade: F
Localization score: 28 / 100

----------------------------
NHT1001 - JSX Text
examples/react-basic/src/App.tsx:4:11
Severity: high
Category: localization
Hardcoded JSX text found: "Welcome"
User-facing JSX text should be moved to localization files.
```

---

## JSON Output

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --json
```

This output is intended for future GitHub Action, MCP, VS Code, and CI integrations.

---

## CI Failure Threshold

```bash
node packages/cli/dist/index.js scan src --fail-on high
```

Allowed severities:

- info
- low
- medium
- high
- critical

Example:

```bash
node packages/cli/dist/index.js scan src --fail-on critical
```

CLI flags take priority over config.

---

## List Supported Rules

```bash
node packages/cli/dist/index.js rules
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
    "node_modules",
    "dist",
    "coverage",
    ".git",
    ".next",
    "build",
    "out"
  ],
  "failOn": "high",
  "componentTextProps": [
    "message",
    "text"
  ]
}
```

`ignore` controls directories skipped during scan.

`failOn` controls CI failure threshold.

`componentTextProps` adds extra custom component prop names that should be checked for hardcoded user-facing text.

Example:

```tsx
<Toast message="Saved successfully" />
<Badge text="New" />
```

These props are checked only on custom components, not native HTML elements.

See:

```txt
docs/engineering/CONFIG_SPEC.md
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

Run tests:

```bash
pnpm test
```

Run the CLI demo:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src
```

Run JSON demo:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --json
```

Run CI-style check:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --fail-on high
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

---

## Sprint Status

Sprint 0 — Foundation: Done  
Sprint 1 — Hello World Scan: Done  
Sprint 2 — Rule System Cleanup: Done  
Sprint 3 — Real-world Detection: In progress

---

## Product Direction

NoHardText is designed to become the ESLint of localization quality.

Future versions will include:

- Stronger real-world detection
- False-positive reduction
- Rule enable/disable config
- JSON reports for CI
- GitHub Action
- Auto-fix
- VS Code extension
- MCP server

---

## License

TBD
