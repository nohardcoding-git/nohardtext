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

---

## Why NoHardText?

Babel can parse code.

NoHardText understands localization quality.

It helps answer:

> Can I ship this release without hardcoded user-facing text?

---

## Current Rules

| Rule ID | Rule | Description |
|---|---|---|
| NHT1001 | JSX Text | Detects hardcoded JSX text |
| NHT1002 | Placeholder Attribute | Detects hardcoded placeholder values |
| NHT1003 | Title Attribute | Detects hardcoded title values |
| NHT1004 | ARIA Label | Detects hardcoded aria-label values |
| NHT1005 | Alt Attribute | Detects hardcoded image alt text |

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

## List Supported Rules

```bash
node packages/cli/dist/index.js rules
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

## Product Direction

NoHardText is designed to become the ESLint of localization quality.

Future versions will include:

- Config file support
- JSON reports
- CI failure modes
- More real-world rules
- Auto-fix
- VS Code extension
- GitHub Action
- MCP server

---

## License

TBD
