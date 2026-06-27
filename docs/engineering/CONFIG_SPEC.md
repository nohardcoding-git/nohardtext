# NoHardText Config Spec

NoHardText supports a lightweight JSON config file at the project root:

```txt
nohardtext.config.json
```

## Current Shape

```json
{
  "ignore": [
    "node_modules",
    "dist",
    "coverage",
    ".git",
    ".next",
    "build",
    "out"
  ],
  "failOn": "high",
  "componentTextProps": ["message", "text"]
}
```

## Fields

### ignore

A list of directory names that NoHardText should skip during scan.

Default ignored directories:

- node_modules
- dist
- coverage
- .git
- .next
- build
- out

Custom ignored directories are merged with the defaults.

Example:

```json
{
  "ignore": ["storybook-static"]
}
```

### failOn

Optional severity threshold for CI failure.

Allowed values:

- info
- low
- medium
- high
- critical

Example:

```json
{
  "failOn": "high"
}
```

This means the CLI should fail if it finds any finding with severity `high` or `critical`.

CLI flag takes priority over config:

```bash
nohardtext scan src --fail-on critical
```

### componentTextProps

Optional list of additional custom component prop names that should be treated as user-facing text.

Default supported component text props:

- label
- description
- helperText
- emptyText
- confirmText
- cancelText
- submitText
- closeText
- primaryText
- secondaryText

Example:

```json
{
  "componentTextProps": ["message", "text"]
}
```

This makes NoHardText report strings like:

```tsx
<Toast message="Saved successfully" />
<Badge text="New" />
```

These props are only reported on custom components, not native HTML elements.

For example, this should be reported:

```tsx
<Button label="Save" />
```

But this should not be reported by the component text prop rule:

```tsx
<div label="Internal label" />
```

## Future Fields

Planned:

```json
{
  "rules": {
    "NHT1001": "error",
    "NHT1002": "off"
  },
  "locales": ["en", "ar"],
  "sourceLocale": "en",
  "translationFiles": ["src/locales/*.json"]
}
```
