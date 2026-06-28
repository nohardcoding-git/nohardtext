# NoHardText Score Methodology

NoHardText reports a localization health score to help teams understand release risk over time.

The score is intentionally simple, deterministic, and CI-friendly. It is not a statistical model. It is a release-readiness signal based on the findings returned by the scan.

## Purpose

The score answers:

> How risky is this scan result from a localization quality perspective?

It is designed to support pull request review, release readiness checks, trend tracking, non-blocking observe mode during rollout, and CI blocking after a team is confident in the false-positive rate.

## Inputs

The score is calculated from the number of findings by severity.

Supported severities:

- `critical`
- `high`
- `medium`
- `low`
- `info`

## Penalty weights

Each finding subtracts points from a starting score of `100`.

| Severity | Penalty per finding |
|---|---:|
| `critical` | 25 |
| `high` | 12 |
| `medium` | 6 |
| `low` | 2 |
| `info` | 0 |

## Score formula

```txt
penalty =
  (critical findings * 25) +
  (high findings * 12) +
  (medium findings * 6) +
  (low findings * 2)

score = max(0, 100 - penalty)
```

`info` findings do not affect the score.

## Grade mapping

| Score range | Grade |
|---:|---|
| `95–100` | `AAA` |
| `90–94` | `AA` |
| `80–89` | `A` |
| `70–79` | `B` |
| `60–69` | `C` |
| `50–59` | `D` |
| `0–49` | `F` |

## Ship decision

NoHardText also emits a ship decision.

| Findings | Decision | Meaning |
|---|---|---|
| No findings | `yes` | No blocking localization findings found |
| Only `medium` and/or `low` findings | `warning` | Non-blocking localization findings found |
| One or more `high` findings | `no` | Blocking localization findings found |
| One or more `critical` findings | `no` | Blocking critical localization findings found |

## Examples

### No findings

```txt
critical: 0
high: 0
medium: 0
low: 0
info: 0

score: 100
grade: AAA
shipDecision: yes
```

### One high-severity finding

```txt
critical: 0
high: 1
medium: 0
low: 0
info: 0

penalty: 12
score: 88
grade: A
shipDecision: no
```

### Medium and low findings only

```txt
critical: 0
high: 0
medium: 1
low: 1
info: 0

penalty: 8
score: 92
grade: AA
shipDecision: warning
```

### Many blocking findings

```txt
critical: 1
high: 3
medium: 2
low: 5
info: 0

penalty:
  (1 * 25) + (3 * 12) + (2 * 6) + (5 * 2)
  = 83

score: 17
grade: F
shipDecision: no
```

## Top issues

NoHardText groups findings by:

```txt
ruleId + category + severity
```

Then it sorts the groups by:

1. highest finding count
2. highest severity

The report shows the top issue groups to help teams focus on the highest-impact cleanup areas first.

## Why the score is simple

NoHardText intentionally keeps the score formula small and explainable.

Teams should be able to reason about a score drop without needing a dashboard or hidden model.

For example:

```txt
A new high-severity hardcoded string usually costs 12 points.
A new low-severity finding usually costs 2 points.
```

## Recommended rollout

For a new project, do not start with a blocking CI gate immediately.

Start with observe mode:

```bash
npx nohardtext scan src --json --output nohardtext-report.json
```

Review findings and tune configuration.

After the team trusts the result quality, enable blocking mode:

```bash
npx nohardtext scan src --fail-on high
```

## Notes

The score is a release-quality signal, not a replacement for human localization review.
