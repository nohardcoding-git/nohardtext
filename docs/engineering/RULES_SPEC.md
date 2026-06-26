# Rules Specification

## Current Rule Catalog

### Localization

| Rule ID | Name | Status | Description |
|---|---|---|---|
| NHT1001 | JSX Text | Implemented | Detects hardcoded user-facing text inside JSX nodes. |
| NHT1002 | Placeholder Attribute | Implemented | Detects hardcoded `placeholder` attribute values. |
| NHT1003 | Title Attribute | Implemented | Detects hardcoded `title` attribute values. |
| NHT1004 | ARIA Label | Implemented | Detects hardcoded `aria-label` attribute values. |
| NHT1005 | Alt Attribute | Implemented | Detects hardcoded `alt` attribute values. |

---

## Rule Template

Each rule should define:

- Rule ID
- Name
- Category
- Severity
- Description
- Why it matters
- Detection logic
- Examples
- False positives
- Auto-fix support
- Configuration options

---

## NHT1001 - JSX Text

### Category

Localization

### Severity

High

### Description

Detects hardcoded text inside JSX nodes.

### Example

```tsx
<h1>Welcome</h1>