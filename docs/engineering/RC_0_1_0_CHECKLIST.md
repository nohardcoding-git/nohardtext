# RC 0.1.0-rc.2 Manual Checklist

Use this checklist before tagging or publishing `0.1.0-rc.2`.

## Required Automated Checks

Run:

```bash
pnpm build
pnpm test
pnpm release:version
pnpm release:check
pnpm release:pack
pnpm release:rc
```

All commands must pass.

## Manual CLI Checks

Run:

```bash
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js --version
node packages/cli/dist/index.js rules
node packages/cli/dist/index.js scan examples/react-basic/src
node packages/cli/dist/index.js scan examples/react-clean/src
```

Expected:

- `--version` prints `NoHardText 0.1.0-rc.2`.
- `rules` prints all built-in rules.
- `react-basic` produces findings.
- `react-clean` produces zero findings.

## JSON Output Check

Run:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --json --output nohardtext-report.json
```

Confirm the JSON includes:

- `schemaVersion`
- `generatedAt`
- `tool`
- `scannedFiles`
- `files`
- `findings`
- `summary`
- `summary.ruleBreakdown`
- `summary.categoryBreakdown`
- `summary.topIssues`
- `ci`

Clean up:

```bash
rm nohardtext-report.json
```

PowerShell:

```powershell
Remove-Item nohardtext-report.json -Force
```

## GitHub Annotation Check

Run:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src --github-annotations --output github-annotations.txt
```

Confirm output includes:

- `::error`
- `NHT1001`
- `NoHardText:`

Clean up:

```bash
rm github-annotations.txt
```

PowerShell:

```powershell
Remove-Item github-annotations.txt -Force
```

## Repository Check

Before tagging, confirm:

```bash
git status
```

Expected:

```txt
nothing to commit, working tree clean
```

## Do Not Release If

Do not tag or publish if:

- any automated check fails
- package versions do not match
- generated files are staged accidentally
- README is outdated
- release notes are missing
- examples do not behave as expected
