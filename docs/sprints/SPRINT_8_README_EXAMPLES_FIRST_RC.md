# Sprint 8 — README, Examples & First Release Candidate

## Status

Done.

## Goal

Prepare NoHardText for a first release candidate by polishing documentation, examples, and release candidate checks.

## Completed

- Reworked the root README for release candidate readiness.
- Added clear CLI usage examples.
- Documented JSON output usage.
- Documented GitHub annotation output usage.
- Documented config usage with `ignore`, `failOn`, `componentTextProps`, and `rules`.
- Added `nohardtext.config.example.json`.
- Added a dirty React example README.
- Added a clean React example.
- Added an examples spec.
- Added version consistency check.
- Added release candidate check script.
- Added `release:version`.
- Added `release:rc`.

## Release Candidate Commands

Run these before creating a release candidate:

```bash
pnpm build
pnpm test
pnpm release:check
pnpm release:pack
pnpm release:version
pnpm release:rc
```

## Example Verification

The release candidate check verifies both example styles:

```bash
node packages/cli/dist/index.js scan examples/react-basic/src
node packages/cli/dist/index.js scan examples/react-clean/src
```

Expected:

- `react-basic` produces findings.
- `react-clean` produces zero findings.

## Files Added or Updated

- `README.md`
- `nohardtext.config.example.json`
- `examples/react-basic/README.md`
- `examples/react-clean/README.md`
- `examples/react-clean/src/App.tsx`
- `docs/engineering/EXAMPLES_SPEC.md`
- `scripts/version-check.cjs`
- `scripts/rc-check.cjs`

## Acceptance Criteria

- `pnpm build` passes.
- `pnpm test` passes.
- `pnpm release:check` passes.
- `pnpm release:pack` passes.
- `pnpm release:version` passes.
- `pnpm release:rc` passes.
- README reflects current CLI behavior.
- Dirty example produces findings.
- Clean example produces zero findings.
- Release candidate scripts do not publish or tag anything automatically.

## Next Sprint

Sprint 9 — First Release Candidate Stabilization.

Focus:

- final manual CLI review
- final package metadata review
- optional version bump
- Git tag preparation
- release notes
- publish decision
