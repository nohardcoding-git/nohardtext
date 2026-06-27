# NoHardText Rule Config Spec

NoHardText supports per-rule configuration through `nohardtext.config.json`.

## Purpose

Rule config lets teams tune NoHardText without changing source code.

It currently supports:

- disabling a built-in rule
- overriding a built-in rule severity

## Config Shape

```json
{
  "rules": {
    "NHT1001": "off",
    "NHT1002": "medium"
  }
}
```

## Supported Rule Values

### Disable a rule

```json
{
  "rules": {
    "NHT1001": "off"
  }
}
```

This removes findings for `NHT1001` from the scan result.

### Override severity

```json
{
  "rules": {
    "NHT1002": "medium"
  }
}
```

This keeps `NHT1002` enabled but reports it as `medium` severity.

Allowed severity values:

- `info`
- `low`
- `medium`
- `high`
- `critical`

## Current Built-in Rules

| Rule ID | Name | Default Category | Default Severity |
|---|---|---|---|
| `NHT1001` | JSX Text | localization | high |
| `NHT1002` | Placeholder Attribute | localization | high |
| `NHT1003` | Title Attribute | localization | high |
| `NHT1004` | ARIA Label | accessibility | high |
| `NHT1005` | Alt Attribute | accessibility | high |
| `NHT1006` | Component Text Prop | localization | high |

## Validation

Rule config is validated when `nohardtext.config.json` is loaded.

Invalid examples:

```json
{
  "rules": "NHT1001"
}
```

Error:

```txt
Invalid config field "rules": expected an object.
```

```json
{
  "rules": {
    "CUSTOM001": "off"
  }
}
```

Error:

```txt
Invalid config field "rules.CUSTOM001": unknown rule id.
```

```json
{
  "rules": {
    "NHT1001": "error"
  }
}
```

Error:

```txt
Invalid config field "rules.NHT1001": expected "off" or one of info, low, medium, high, critical.
```

## Interaction with Reports

Rule config is applied before summaries are calculated.

That means:

- disabled rules do not appear in findings
- disabled rules do not affect total finding counts
- severity overrides affect summary counts
- severity overrides affect CI failure behavior

## Future Extensions

Possible future rule config values:

```json
{
  "rules": {
    "NHT1001": {
      "severity": "medium",
      "enabled": true
    }
  }
}
```

The current MVP intentionally keeps rule config simple.
