# Sprints

## Sprint 0 - Foundation

### Status

Done

### Goal

Create the product, documentation, architecture, and repository foundation for NoHardText.

### Delivered

- GitHub organization and repository
- Initial documentation structure
- Product vision RFC
- Product PRD
- Architecture overview
- Rules specification skeleton
- Monorepo setup
- TypeScript setup
- pnpm workspace
- CI workflow

---

## Sprint 1 - Hello World Scan

### Status

Done

### Goal

Build the first working vertical slice:

React source file -> parser -> detection -> report -> CLI output.

### Delivered

- Babel-based parser package
- JSX text detection
- JSX string attribute detection
- CLI scan command
- Terminal report output
- Localization score and grade proof of concept
- Basic React example fixture
- Build and test coverage
- CI validation

### Supported Rules

- NHT1001 - JSX Text
- NHT1002 - Placeholder Attribute
- NHT1003 - Title Attribute
- NHT1004 - ARIA Label
- NHT1005 - Alt Attribute

### Exit Criteria

Sprint 1 is complete when the CLI can scan `examples/react-basic/src` and report all supported findings.

Status: Complete.

---

## Sprint 2 - Rule System Cleanup

### Status

Next

### Goal

Make rules easier to define, register, document, configure, and extend.

### Planned Scope

- Rule metadata model
- Built-in rules registry
- Rule documentation alignment
- Central rule IDs
- Cleaner exports
- Prepare for config-based rule enable/disable
