# Sprint 12.2 — Score Methodology Docs

## Status

Done.

## Goal

Document the NoHardText localization health score so teams understand how the score, grade, top issues, and ship decision are calculated.

## Why this sprint matters

A public review identified that the localization health score was useful but opaque.

This sprint makes the scoring model transparent and easier to trust.

## Scope

This sprint documents:

- severity penalty weights
- score formula
- grade thresholds
- ship decision logic
- top issue grouping
- rollout recommendation
- observe mode before blocking CI

## Score summary

NoHardText starts from a score of `100`.

Each finding subtracts a severity-based penalty:

| Severity | Penalty |
|---|---:|
| `critical` | 25 |
| `high` | 12 |
| `medium` | 6 |
| `low` | 2 |
| `info` | 0 |

Formula:

```txt
score = max(0, 100 - penalty)
```

## Grade summary

| Score range | Grade |
|---:|---|
| `95–100` | `AAA` |
| `90–94` | `AA` |
| `80–89` | `A` |
| `70–79` | `B` |
| `60–69` | `C` |
| `50–59` | `D` |
| `0–49` | `F` |

## Ship decision summary

| Condition | Decision |
|---|---|
| No findings | `yes` |
| Only medium/low findings | `warning` |
| One or more high findings | `no` |
| One or more critical findings | `no` |

## Files added

```txt
docs/engineering/SCORE_METHODOLOGY.md
docs/sprints/SPRINT_12_2_SCORE_METHODOLOGY.md
```

## Acceptance criteria

- Score formula is documented.
- Grade mapping is documented.
- Ship decision logic is documented.
- Observe-mode rollout is recommended.
- The score is explainable without reading source code.
- The docs directly address the adoption concern that the score methodology was opaque.

## Next sprint

Sprint 12.3 — Non-blocking Adoption Docs.

Focus:

- explain observe mode
- explain blocking mode
- show staged rollout path
- provide GitHub Actions examples for non-blocking and blocking usage
