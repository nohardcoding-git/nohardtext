# NoHardText GitHub Actions Spec

## Goal

Run NoHardText in GitHub Actions and surface hardcoded UI string findings as GitHub annotations.

## Workflow

The workflow file is located at:

```txt
.github/workflows/nohardtext.yml
```

It runs on:

- pull requests
- pushes to `main`

## Default Scan Path

The default scan path is:

```yaml
NOHARDTEXT_SCAN_PATH: packages
```

This is intentionally set to `packages` for the NoHardText repository itself.

For consumer projects, this can usually be changed to:

```yaml
NOHARDTEXT_SCAN_PATH: src
```

or any project-specific source folder.

## CI Command

The workflow runs:

```bash
node packages/cli/dist/index.js scan "$NOHARDTEXT_SCAN_PATH" \
  --github-annotations \
  --fail-on high | tee nohardtext-annotations.txt
```

## Why `tee` Is Used

GitHub annotations must be printed to stdout to appear in the pull request UI.

`tee` keeps the annotation output visible in the workflow logs and also saves it to:

```txt
nohardtext-annotations.txt
```

The saved file is uploaded as a workflow artifact.

## Failure Behavior

The workflow fails when NoHardText finds a finding at or above the configured severity threshold:

```bash
--fail-on high
```

This means:

- `high` findings fail CI
- `critical` findings fail CI
- `medium`, `low`, and `info` findings do not fail CI

## Output Format

A finding is emitted as a GitHub annotation like:

```txt
::error file=App.tsx,line=4,col=20,title=NHT1001 - JSX Text::[high][localization] Hardcoded JSX text found: "Save"
```

## Notes

The workflow builds the local monorepo before running the CLI because NoHardText is not assumed to be installed globally or published yet.
