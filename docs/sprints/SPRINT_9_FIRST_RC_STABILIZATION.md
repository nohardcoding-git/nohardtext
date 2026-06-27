# Sprint 9 — First Release Candidate Stabilization

## Status

Done.

## Goal

Stabilize the first NoHardText release candidate and prepare the repository for a safe manual RC publish decision.

## Completed

- Bumped all workspace packages to `0.1.0-rc.1`.
- Updated CLI version output to `NoHardText 0.1.0-rc.1`.
- Added release notes for `0.1.0-rc.1`.
- Added manual RC checklist.
- Verified build, test, release check, package pack check, version check, and RC check.
- Created the annotated Git tag `v0.1.0-rc.1`.
- Added publish strategy documentation.
- Added a publish plan script.
- Added `release:publish-plan`.
- Confirmed publish order and RC npm dist-tag strategy.
- Kept actual npm publishing manual and intentional.

## Release Candidate

```txt
0.1.0-rc.1
```

## Git Tag

```txt
v0.1.0-rc.1
```

## Required Validation Commands

The following commands should pass before publishing:

```bash
pnpm build
pnpm test
pnpm release:version
pnpm release:check
pnpm release:pack
pnpm release:rc
pnpm release:publish-plan
```

## Publish Strategy

The release candidate should be published with:

```txt
npm dist-tag: rc
```

Do not publish this release candidate with the `latest` tag.

## Package Publish Order

1. `@nohardtext/domain`
2. `@nohardtext/parser`
3. `@nohardtext/rule-engine`
4. `@nohardtext/report-engine`
5. `@nohardtext/detect-engine`
6. `@nohardtext/cli`

## Why Manual Publish?

For the first RC, publishing should stay manual because:

- npm scope/access needs to be confirmed.
- package names may need verification.
- dist-tag behavior should be observed carefully.
- accidental `latest` publishing should be avoided.
- the first public package release is a sensitive step.

## Acceptance Criteria

- All automated checks pass.
- Git working tree is clean.
- RC version is consistent across all packages.
- CLI version matches package version.
- RC tag exists.
- Release notes exist.
- Publish strategy exists.
- Publish plan prints valid commands.
- No npm publish happens automatically.

## Next Sprint

Sprint 10 — npm RC Publish & Post-publish Verification.

Focus:

- npm login/access check
- package name availability check
- manual RC publish
- post-publish npm verification
- install test in a fresh temp project
- `npx` / binary smoke test
- decide if another RC is needed
