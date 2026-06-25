# Product Requirements Document (PRD)

Version: 1.0

Status: Draft

Product: NoHardText

Owner: NoHardText Team

---

# Executive Summary

NoHardText is a developer productivity platform that helps teams detect, understand, fix, and prevent hardcoded user-facing text before software reaches production.

The product focuses on localization quality rather than translation.

---

# Problem Statement

Frontend applications naturally accumulate hardcoded user-facing strings over time.

As projects grow this leads to:

- difficult localization
- inconsistent translation keys
- duplicate strings
- poor RTL support
- missing translations
- expensive maintenance

Existing localization libraries solve translation.

They do not solve localization quality.

---

# Solution

NoHardText continuously analyzes the project and measures localization quality.

It identifies issues, explains them, recommends fixes, and eventually automates the repair process.

---

# Vision

Become the industry standard for localization quality.

Developers should install NoHardText at the beginning of every multilingual project just like ESLint or Prettier.

---

# Target Audience

Primary

- React developers
- Frontend teams
- Electron developers
- Next.js developers

Secondary

- React Native
- Vue
- Angular
- Enterprise teams

---

# User Goals

Developers want to know:

- Can I safely release?
- Is localization complete?
- What should I fix first?
- Which files need attention?
- How healthy is my project?

---

# Core User Journey

Install

↓

Scan

↓

Understand

↓

Fix

↓

Validate

↓

Ship

---

# Product Goals

The first release should allow developers to:

- discover localization issues
- understand why they exist
- estimate project health
- prioritize fixes

---

# Success Metrics

Success is measured by:

- scan accuracy
- false positive rate
- scan speed
- developer adoption
- repeat usage
- localization score improvement

---

# Out of Scope

Version 1 will NOT include:

- translation management
- cloud synchronization
- collaborative editing
- localization hosting
- translation memory

---

# Product Philosophy

NoHardText should:

- be safe
- be deterministic
- be fast
- be extensible
- explain every finding
- never modify code unless requested

---

# Long Term Vision

NoHardText evolves into a complete Localization Quality Platform including:

- CLI
- VS Code Extension
- GitHub Action
- MCP Server
- Dashboard
- Enterprise Reports
- AI Assistant

---

# Product Pillars

## Detect

Find problems.

---

## Understand

Explain problems.

---

## Fix

Provide deterministic fixes.

---

## Validate

Verify correctness.

---

## Prevent

Stop issues before release.

---

# Release Philosophy

Every release should increase developer confidence.

The product is successful when developers trust its "Can I Ship?" recommendation.