# Publish Strategy

## Purpose

This document describes the safe publishing strategy for the first NoHardText release candidate.

The goal is to publish packages carefully, in dependency order, using the `rc` npm dist-tag instead of `latest`.

## Current RC

```txt
0.1.0-rc.2
```

## Dist Tag

Use:

```txt
rc
```

Do not publish the release candidate with the `latest` dist-tag.

## Package Order

Publish packages in this order:

1. `@nohardcoding/nohardtext-domain`
2. `@nohardcoding/nohardtext-parser`
3. `@nohardcoding/nohardtext-rule-engine`
4. `@nohardcoding/nohardtext-report-engine`
5. `@nohardcoding/nohardtext-detect-engine`
6. `@nohardcoding/nohardtext`

## Why This Order?

Lower-level packages should be available before packages that depend on them.

The CLI should be published last because it depends on the rest of the workspace.

## Required Checks Before Publishing

Run:

```bash
pnpm build
pnpm test
pnpm release:version
pnpm release:check
pnpm release:pack
pnpm release:rc
```

All checks must pass.

## Publish Plan Script

Run:

```bash
pnpm release:publish-plan
```

This prints:

- package order
- version
- recommended dist-tag
- manual publish commands

It does not publish anything.

## Manual Publish Commands

From the repository root, publish in package order.

Example:

```bash
cd packages/domain
pnpm publish --access public --tag rc
cd ../..
```

Repeat for every package in the publish order.

## After Publishing

Check the CLI package:

```bash
npm view @nohardcoding/nohardtext@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext dist-tags
```

Expected:

- version exists
- `rc` points to `0.1.0-rc.2`
- `latest` is not changed unless intentionally released later

## Do Not Publish If

Do not publish if:

- any release check fails
- package versions do not match
- Git working tree is dirty
- RC tag is missing
- package pack check fails
- README or release notes are outdated
- npm account is not ready
- organization/package scope access is unclear

## Notes

This repository should not automatically publish from local scripts yet.

Publishing should remain manual for the first release candidate.
