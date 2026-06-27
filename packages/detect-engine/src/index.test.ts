import { describe, expect, it } from "vitest";
import {
  detect,
  detectAltAttributeText,
  detectAriaLabelText,
  detectJsxText,
  detectPlaceholderText,
  detectTitleAttributeText,
  detectCustomComponentPropText,
  sortFindingsByLocation
} from "./index";
import type { Rule } from "@nohardcoding/nohardtext-rule-engine";

describe("@nohardcoding/nohardtext-detect-engine", () => {
  it("detects hardcoded JSX text", () => {
    const findings = detectJsxText(
      "src/App.tsx",
      `
        export default function App() {
          return (
            <>
              <h1>Welcome</h1>
              <button>Start Game</button>
              <div className="hero" />
            </>
          );
        }
      `
    );

    expect(findings).toHaveLength(2);
    expect(findings[0]?.ruleId).toBe("NHT1001");
    expect(findings[1]?.message).toContain("Start Game");
  });

  it("detects hardcoded placeholder text", () => {
    const findings = detectPlaceholderText(
      "src/App.tsx",
      `export default function App() { return <input placeholder="Search..." />; }`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("NHT1002");
  });

    it("sorts findings by source location", () => {
    const sorted = sortFindingsByLocation([
      {
        id: "second",
        ruleId: "NHT1002",
        severity: "high",
        category: "localization",
        message: "Second.",
        explanation: "Second.",
        location: {
          filePath: "src/App.tsx",
          startLine: 10,
          startColumn: 1,
          endLine: 10,
          endColumn: 5
        },
        fixable: true,
        suggestions: []
      },
      {
        id: "first",
        ruleId: "NHT1001",
        severity: "high",
        category: "localization",
        message: "First.",
        explanation: "First.",
        location: {
          filePath: "src/App.tsx",
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 5
        },
        fixable: true,
        suggestions: []
      }
    ]);

    expect(sorted.map((finding) => finding.id)).toEqual(["first", "second"]);
  });

  it("detects hardcoded title attribute text", () => {
    const findings = detectTitleAttributeText(
      "src/App.tsx",
      `export default function App() { return <button title="Start the game">Start Game</button>; }`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("NHT1003");
  });

  it("detects hardcoded aria-label text", () => {
    const findings = detectAriaLabelText(
      "src/App.tsx",
      `export default function App() { return <button aria-label="Start button">Start Game</button>; }`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("NHT1004");
  });

  it("detects hardcoded alt attribute text", () => {
    const findings = detectAltAttributeText(
      "src/App.tsx",
      `export default function App() { return <img src="/logo.png" alt="Game logo" />; }`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("NHT1005");
    expect(findings[0]?.message).toContain("Game logo");
  });

    it("detects hardcoded component prop text", () => {
    const findings = detectCustomComponentPropText(
      "src/App.tsx",
      `
        export default function App() {
          return (
            <>
              <Button label="Save" />
              <EmptyState description="Try another search" />
              <Modal confirmText="Delete" cancelText="Cancel" />
            </>
          );
        }
      `
    );

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006"
    ]);

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded component prop "label" found: "Save"',
      'Hardcoded component prop "description" found: "Try another search"',
      'Hardcoded component prop "confirmText" found: "Delete"',
      'Hardcoded component prop "cancelText" found: "Cancel"'
    ]);
  });

  it("detects all supported rules together", () => {
    const result = detect({
      filePath: "src/App.tsx",
      sourceText: `
        export default function App() {
          return (
            <>
              <h1>Welcome</h1>
              <button title="Start the game" aria-label="Start button">
                Start Game
              </button>
              <input placeholder="Search..." />
              <img src="/logo.png" alt="Game logo" />
              <Button label="Continue" />
            </>
          );
        }
      `
    });

    expect(result.findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1003",
      "NHT1004",
      "NHT1001",
      "NHT1002",
      "NHT1005",
      "NHT1006"
    ]);
  });

  it("keeps compatibility with custom rules", () => {
    const rule: Rule = {
      id: "CUSTOM001",
      name: "Custom Rule",
      run: () => [
        {
          id: "finding-1",
          ruleId: "CUSTOM001",
          severity: "info",
          category: "developer-experience",
          message: "Custom finding.",
          explanation: "Custom rule result.",
          location: {
            filePath: "src/App.tsx",
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 1
          },
          fixable: false,
          suggestions: []
        }
      ]
    };

    const result = detect({
      filePath: "src/App.tsx",
      sourceText: "export default function App() { return null; }",
      rules: [rule]
    });

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.ruleId).toBe("CUSTOM001");
  });
});
