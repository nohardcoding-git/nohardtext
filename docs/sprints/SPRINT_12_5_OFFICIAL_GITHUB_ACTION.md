# Sprint 12.5 — Official Reusable GitHub Action

## Status

Ready for implementation.

## Goal

Provide an official reusable GitHub Action so users can run NoHardText with:

```yaml
- uses: nohardcoding-git/nohardtext@main
  with:
    path: src
    fail-on: high
```

After the next patch release, production users should pin to a tag such as:

```yaml
- uses: nohardcoding-git/nohardtext@v0.1.1
```

## Why this matters

Before this sprint, NoHardText supported GitHub Actions annotations through the CLI, but users still had to write their own install and `npx` steps.

This sprint creates an official action interface with documented inputs for:

- scan path
- failure threshold
- GitHub annotations
- JSON output
- report output path
- config file path
- npm package version

## Files added

```txt
action.yml
docs/engineering/GITHUB_ACTION.md
docs/sprints/SPRINT_12_5_OFFICIAL_GITHUB_ACTION.md
examples/github-actions/nohardtext-action-observe.yml
examples/github-actions/nohardtext-action-warning.yml
examples/github-actions/nohardtext-action-blocking.yml
```

## Acceptance criteria

- `action.yml` exists at the repository root.
- The action runs the published npm package through `npx`.
- The action supports observe, warning, and blocking mode.
- The action emits GitHub annotations by default.
- The action supports JSON report output.
- Docs explain version pinning and avoid mutating the existing `v0.1.0` release tag.
- Full checks pass.

## Release note

This action should be included in the next patch release, not retroactively added to `v0.1.0`.
