# CLI and CI Usage Spec

## Purpose

This document describes the current CLI and CI-facing output behavior for NoHardText.

## Basic Scan

```bash
nohardtext scan src
```

Prints a human-readable report.

## JSON Output

```bash
nohardtext scan src --json
```

Prints a JSON report to stdout.

## JSON Output File

```bash
nohardtext scan src --json --output nohardtext-report.json
```

Writes the JSON report to a file.

Nested output folders are created automatically:

```bash
nohardtext scan src --json --output reports/nohardtext/report.json
```

## GitHub Actions Annotation Output

```bash
nohardtext scan src --github-annotations
```

Prints GitHub Actions annotation lines.

## GitHub Actions Annotation Output File

```bash
nohardtext scan src --github-annotations --output reports/nohardtext/github-annotations.txt
```

Writes annotation output to a file.

## CI Failure Threshold

```bash
nohardtext scan src --fail-on high
```

Supported severity values:

- `info`
- `low`
- `medium`
- `high`
- `critical`

When findings meet or exceed the configured threshold, the CLI sets exit code `1`.

## JSON + CI

```bash
nohardtext scan src --json --fail-on high
```

The JSON report includes:

```json
{
  "ci": {
    "enabled": true,
    "failOn": "high",
    "passed": false
  }
}
```

## GitHub Actions Recommended Command

```bash
nohardtext scan "$NOHARDTEXT_SCAN_PATH" --github-annotations --fail-on high
```

## Help

```bash
nohardtext --help
nohardtext -h
```

## Version

```bash
nohardtext --version
nohardtext -v
```

## Output Mode Rules

Use one output mode at a time:

- Human report: default
- JSON report: `--json`
- GitHub annotations: `--github-annotations`

`--json` and `--github-annotations` should not be used together.
