# Architecture

## Goal

NoHardText is built as a modular engine-first developer tool.

The same engine should power:

- CLI
- VS Code Extension
- GitHub Action
- MCP Server

## Architecture Principles

- Engine first
- Plugin first
- AST based
- AI optional
- Deterministic output
- Safe fixes only
- Shared domain model

## Main Layers

```text
CLI / VS Code / GitHub Action / MCP
              |
        Report Engine
              |
      Prevention Engine
              |
      Validation Engine
              |
          Fix Engine
              |
   Understanding Engine
              |
        Detect Engine
              |
        Plugin SDK
              |
       Domain Model