# Release Candidate Spec

## Purpose

A NoHardText release candidate is a build that is ready for final manual review before publishing or tagging.

Release candidate checks should prove that the repository is internally consistent and that the CLI works in realistic local scenarios.

## Required Commands

Before creating a release candidate, run:

```bash
pnpm build
pnpm test
pnpm release:check
pnpm release:pack
pnpm release:version
pnpm release:rc
```

All commands must pass.

## release:version

Command:

```bash
pnpm release:version
```

Validates that all workspace package versions match the root package version.

Checked files:

```txt
package.json
packages/domain/package.json
packages/parser/package.json
packages/rule-engine/package.json
packages/detect-engine/package.json
packages/report-engine/package.json
packages/cli/package.json
```

## release:rc

Command:

```bash
pnpm release:rc
```

Runs:

```bash
pnpm release:version
pnpm release:check
pnpm release:pack
node packages/cli/dist/index.js scan examples/react-basic/src
node packages/cli/dist/index.js scan examples/react-clean/src
```

## Expected Example Results

### react-basic

Expected:

- findings greater than 0
- ship decision should not be `yes`

### react-clean

Expected:

- findings equal 0
- ship decision should be `yes`

## Release Candidate Rules

A release candidate should not be created if:

- build fails
- tests fail
- release checks fail
- package pack check fails
- package versions do not match
- README is outdated
- examples are broken
- generated temporary files are staged

## What RC Scripts Must Not Do

Release candidate scripts must not:

- publish packages
- create Git tags
- push commits
- require network services
- mutate source files

They are validation scripts only.
