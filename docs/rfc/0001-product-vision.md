# RFC-0001: Product Vision

## Status

Accepted

## Product Name

NoHardText

## Tagline

Never ship hardcoded UI strings again.

## Mission

NoHardText helps developers detect, understand, fix, and prevent user-facing hardcoded text before it reaches production.

## Vision

NoHardText aims to become the standard localization quality platform for modern frontend projects.

The long-term goal is for developers to treat NoHardText like ESLint or Prettier: a default tool installed at the beginning of every serious multilingual project.

## Problem

Modern frontend projects often accumulate hardcoded UI strings over time.

Examples include:

- JSX text
- Button labels
- Input placeholders
- Toast messages
- Dialog text
- ARIA labels
- Page titles
- Validation messages
- User-facing error messages

These strings are easy to miss during development and expensive to fix later.

## Non-Goals

NoHardText is not:

- A translation management platform
- A replacement for i18next, Lingui, FormatJS, Lokalise, Crowdin, or Phrase
- A general-purpose linter
- A design tool
- A visual asset tool

NoHardText works before translation platforms by improving localization readiness and quality inside the codebase.

## Core Product Loop

NoHardText follows this loop:

1. Detect
2. Understand
3. Fix
4. Validate
5. Prevent

## Product Principles

### 1. Never Break Code

Auto-fixes must be AST-based and safe.

### 2. AI Optional

The product must work without AI. AI may explain, suggest, and assist, but deterministic engine logic must remain the source of truth.

### 3. Zero Config First

A new user should be able to run NoHardText without writing configuration.

### 4. Plugin First

Framework-specific behavior must live in plugins, not in the core engine.

### 5. Explain Everything

Every finding should include what happened, why it matters, and how to fix it.

### 6. Prevention Over Detection

The product should not only find issues. It should prevent them from reaching production.

## Target Users

Initial target:

- React developers
- Frontend teams
- Electron developers using React
- Next.js teams

Future targets:

- React Native
- Vue
- Angular
- Design systems
- Enterprise localization teams

## Strategic Positioning

NoHardText is a localization quality platform.

It does not compete directly with translation libraries. It complements them by ensuring code is ready for localization.

## Open Core Strategy

The community version should provide useful scanning and reporting.

Advanced automation, AI assistance, team workflows, hosted dashboards, and enterprise features may be part of a paid Pro or Team offering.

## Success Criteria

NoHardText succeeds when developers can confidently answer:

> Can I ship this release without hardcoded user-facing text?

The ideal answer from NoHardText is:

- Yes
- Ship with warnings
- Do not ship

## Internal Motto

Every feature must earn its place.

A feature should only be added if it:

1. Solves a recurring developer problem
2. Saves meaningful time
3. Improves release confidence