# npm RC Publish Gate

Use this gate before publishing `0.1.0-rc.2` to npm.

## Required State

Before publishing, confirm:

```bash
git status
```

Expected:

```txt
nothing to commit, working tree clean
```

Confirm tag exists:

```bash
git tag --list "v0.1.0-rc.2"
```

Confirm release checks pass:

```bash
pnpm build
pnpm test
pnpm release:version
pnpm release:check
pnpm release:pack
pnpm release:rc
pnpm release:publish-plan
```

## npm Account Check

Run:

```bash
npm whoami
```

If this fails, login first:

```bash
npm login
```

## Scope Access Check

Before publishing scoped packages, confirm the npm account can publish under:

```txt
@nohardcoding
```

If the scope does not exist yet, create it or confirm org access on npm.

## Dist Tag

Use:

```txt
rc
```

Never use `latest` for `0.1.0-rc.2`.

## Manual Publish Commands

Publish in this order:

```bash
cd packages/domain
pnpm publish --access public --tag rc
cd ../..

cd packages/parser
pnpm publish --access public --tag rc
cd ../..

cd packages/rule-engine
pnpm publish --access public --tag rc
cd ../..

cd packages/report-engine
pnpm publish --access public --tag rc
cd ../..

cd packages/detect-engine
pnpm publish --access public --tag rc
cd ../..

cd packages/cli
pnpm publish --access public --tag rc
cd ../..
```

## Post-publish Verification

After publishing, run:

```bash
npm view @nohardcoding/nohardtext@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext dist-tags
```

Expected:

- `0.1.0-rc.2` exists.
- `rc` points to `0.1.0-rc.2`.
- `latest` is not changed unintentionally.

## Fresh Install Smoke Test

Use a new temporary folder outside the repo:

```bash
mkdir nohardtext-install-test
cd nohardtext-install-test
npm init -y
npm install @nohardcoding/nohardtext@rc
npx nohardtext --version
npx nohardtext --help
cd ..
```

Expected version:

```txt
NoHardText 0.1.0-rc.2
```

## Do Not Publish If

Do not publish if:

- npm login is not confirmed
- npm scope access is unclear
- release checks fail
- package versions do not match
- working tree is dirty
- tag is missing
- publish plan does not print correctly
- there is any doubt about dist-tag behavior
