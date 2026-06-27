# Sprint 5 — CLI and CI Polish

## Status

Done.

## Goal

Improve the CLI experience and make NoHardText easier to use in CI pipelines.

## Completed

- Added `--output` support for writing scan output to a file.
- Added automatic creation of nested output directories.
- Added GitHub Actions annotation output using `--github-annotations`.
- Added CI metadata to JSON output.
- Added JSON report metadata:
  - `schemaVersion`
  - `generatedAt`
  - `tool`
  - `scannedFiles`
  - `files`
  - `ci`
- Added `--help` and `-h` output polish.
- Added `--version` and `-v`.
- Added `formatHelpOutput()`.
- Added `formatVersionOutput()`.
- Added `getCliVersion()`.
- Added a GitHub Actions workflow template.
- Added tests for JSON output files, nested output directories, GitHub annotation output, help output, and version output.

## CLI Commands Covered

```bash
nohardtext scan <path>
nohardtext scan <path> --json
nohardtext scan <path> --json --output nohardtext-report.json
nohardtext scan <path> --github-annotations --fail-on high
nohardtext scan <path> --fail-on high
nohardtext rules
nohardtext --help
nohardtext --version
```

## GitHub Actions Usage

```yaml
- name: Run NoHardText
  run: node packages/cli/dist/index.js scan "$NOHARDTEXT_SCAN_PATH" --github-annotations --fail-on high
```

## JSON Report Usage

```bash
nohardtext scan src --json --output reports/nohardtext/report.json
```

## GitHub Annotation Output

```bash
nohardtext scan src --github-annotations --fail-on high
```

Example output:

```txt
::error file=App.tsx,line=4,col=20,title=NHT1001 - JSX Text::[high][localization] Hardcoded JSX text found: "Save" User-facing JSX text should be moved to localization files.
NoHardText: 1 finding(s). 1 high-severity localization findings found. Score: 88/100.
```

## Notes

Sprint 5 focused on making the CLI practical for real projects and CI workflows.

## Next Sprint

Sprint 6 — Reporting Engine Polish.

Focus:

- Improve human-readable report formatting.
- Improve summary language.
- Add stable report contracts.
- Prepare report output for future dashboard and VS Code integrations.
