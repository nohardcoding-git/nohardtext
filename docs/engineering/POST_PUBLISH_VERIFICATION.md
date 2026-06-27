# Post-publish Verification

Use this checklist after publishing `0.1.0-rc.2`.

## npm Metadata

Check each package:

```bash
npm view @nohardcoding/nohardtext-domain@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext-parser@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext-rule-engine@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext-report-engine@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext-detect-engine@0.1.0-rc.2 version
npm view @nohardcoding/nohardtext@0.1.0-rc.2 version
```

## Dist Tags

Check:

```bash
npm view @nohardcoding/nohardtext dist-tags
```

Expected:

```txt
rc: 0.1.0-rc.2
```

The `latest` tag should not point to the RC unless intentionally changed later.

## Fresh Install Test

Create a temporary test project:

```bash
mkdir nohardtext-install-test
cd nohardtext-install-test
npm init -y
npm install @nohardcoding/nohardtext@rc
```

Create a small file:

```bash
mkdir src
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return <button>Save</button>;
}
```

Run:

```bash
npx nohardtext --version
npx nohardtext scan src
npx nohardtext scan src --json --output nohardtext-report.json
```

Expected:

- version prints `NoHardText 0.1.0-rc.2`
- scan finds hardcoded JSX text
- JSON report is created

## Clean Fixture Test

Replace `src/App.tsx` with:

```tsx
function t(key: string): string {
  return key;
}

export default function App() {
  return <button>{t("actions.save")}</button>;
}
```

Run:

```bash
npx nohardtext scan src
```

Expected:

```txt
Findings: 0
Can I ship? Yes
```

## Cleanup

After testing:

```bash
cd ..
rm -rf nohardtext-install-test
```

PowerShell:

```powershell
Set-Location ..
Remove-Item nohardtext-install-test -Recurse -Force
```

## If Something Fails

Do not promote the RC to `latest`.

Create a fix branch, publish a new RC version such as:

```txt
0.1.0-rc.2
```
