# Sprint 4 — Config System

## Status

Done.

## Goal

Make NoHardText configuration explicit, validated, predictable, and ready for CI and future integrations.

## Completed

- Added strict config validation for `nohardtext.config.json`.
- Added validation for unknown config fields.
- Added validation for `ignore` as `string[]`.
- Added validation for `componentTextProps` as `string[]`.
- Added validation for `failOn` severity values.
- Added clear config error messages.
- Added rule-level configuration through `rules`.
- Added support for disabling built-in rules with `"off"`.
- Added support for severity overrides per built-in rule.
- Added tests for valid config loading.
- Added tests for invalid config fields.
- Added tests for invalid rule config values.
- Added tests for disabling a rule.
- Added tests for rule severity override.

## Config Shape

```json
{
  "ignore": ["dist", "storybook-static"],
  "failOn": "high",
  "componentTextProps": ["message", "text"],
  "rules": {
    "NHT1001": "off",
    "NHT1002": "medium"
  }
}
```

## Supported Fields

| Field | Type | Description |
|---|---|---|
| `ignore` | `string[]` | Directory names skipped during scan |
| `failOn` | severity | CI failure threshold |
| `componentTextProps` | `string[]` | Extra custom component props treated as user-facing text |
| `rules` | object | Per-rule disable or severity override config |

## Severity Values

Allowed severity values:

- `info`
- `low`
- `medium`
- `high`
- `critical`

## Rule Config Values

Each rule can be configured as either:

- `"off"` to disable the rule
- a severity value to override the finding severity

Example:

```json
{
  "rules": {
    "NHT1001": "off",
    "NHT1002": "medium"
  }
}
```

This disables JSX text findings and changes placeholder findings to medium severity.

## Validation Behavior

Invalid config should fail early with clear errors.

Examples:

```txt
Invalid config field "unknownField": unknown field.
Invalid config field "ignore": expected string[].
Invalid config field "componentTextProps": expected string[].
Invalid config field "failOn": expected one of info, low, medium, high, critical.
Invalid config field "rules": expected an object.
Invalid config field "rules.CUSTOM001": unknown rule id.
Invalid config field "rules.NHT1001": expected "off" or one of info, low, medium, high, critical.
```

## Notes

Sprint 4 keeps configuration intentionally small and predictable. The goal is to support useful CI workflows without introducing a complex config model too early.

## Next Sprint

Sprint 5 — CLI and CI Polish.

Focus:

- Improve CLI help output.
- Add clearer exit-code behavior docs.
- Add report file docs.
- Prepare GitHub Action usage.
- Add examples for CI pipelines.
