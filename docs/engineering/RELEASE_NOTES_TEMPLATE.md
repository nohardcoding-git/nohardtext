# Release Notes Template

## Version

`0.0.0-rc.1`

## Summary

NoHardText is a localization quality CLI for detecting hardcoded user-facing UI strings before release.

## Highlights

- React / TSX hardcoded text detection.
- Built-in rule metadata.
- JSON report output.
- GitHub Actions annotation output.
- Config validation.
- Rule enable/disable config.
- Rule severity overrides.
- Custom component text prop detection.
- Reporting breakdowns.
- Top issues summary.
- Release checks.
- Package pack checks.

## CLI Commands

```bash
nohardtext scan src
nohardtext scan src --json
nohardtext scan src --json --output nohardtext-report.json
nohardtext scan src --github-annotations --fail-on high
nohardtext rules
nohardtext --help
nohardtext --version
```

## Release Validation

Before publishing this release candidate, these commands passed:

```bash
pnpm build
pnpm test
pnpm release:check
pnpm release:pack
pnpm release:version
pnpm release:rc
```

## Known Limitations

- React / TSX support is the main current focus.
- Auto-fix is not implemented yet.
- VS Code extension is not implemented yet.
- MCP server is not implemented yet.
- Hosted reporting is not implemented yet.

## Next

- Stabilize RC feedback.
- Decide package publish strategy.
- Prepare first public release.
