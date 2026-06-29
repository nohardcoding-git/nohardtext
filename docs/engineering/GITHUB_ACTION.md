# NoHardText GitHub Action

NoHardText provides a reusable GitHub Action for detecting hardcoded user-facing strings in React/TSX projects.

The action is implemented as a composite action. It runs the published npm package through `npx`, so users do not need to vendor NoHardText in their repository.

## Usage

```yaml
name: NoHardText

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  nohardtext:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: nohardcoding-git/nohardtext@main
        with:
          path: src
          fail-on: high
          github-annotations: "true"
```

## Production version pinning

During local development of the action, examples can use:

```yaml
uses: nohardcoding-git/nohardtext@main
```

For production repositories, prefer a tag once the action is released:

```yaml
uses: nohardcoding-git/nohardtext@v0.1.1
```

Do not move the existing `v0.1.0` tag to include this action. Release the action in a new patch version instead.

## Inputs

| Input | Default | Description |
|---|---:|---|
| `path` | `src` | File or directory to scan. |
| `fail-on` | `high` | Minimum severity that fails the action. Use `critical`, `high`, `medium`, `low`, `info`, or `none`. |
| `github-annotations` | `true` | Emits GitHub Actions annotations. |
| `json` | `false` | Emits JSON output. |
| `output` | empty | Writes output to a file path. |
| `config` | empty | Path to a NoHardText config file. |
| `version` | `latest` | NoHardText npm package version to run. |

## Outputs

| Output | Description |
|---|---|
| `report-path` | Path to the generated report when the `output` input is set. |

## Observe mode

```yaml
- uses: nohardcoding-git/nohardtext@main
  with:
    path: src
    fail-on: none
    github-annotations: "true"
    json: "true"
    output: nohardtext-report.json
```

## Warning mode

```yaml
- uses: nohardcoding-git/nohardtext@main
  with:
    path: src
    fail-on: none
    github-annotations: "true"
```

## Blocking mode

```yaml
- uses: nohardcoding-git/nohardtext@main
  with:
    path: src
    fail-on: high
    github-annotations: "true"
```

## Recommended rollout

Use the action in this order:

```txt
observe -> warning -> blocking
```

For existing codebases, do not start with blocking mode before reviewing at least one report.
