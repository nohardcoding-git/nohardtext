import { describe, expect, it } from "vitest";
import {
  detect,
  detectAltAttributeText,
  detectAriaLabelText,
  detectJsxText,
  detectPlaceholderText,
  detectTitleAttributeText
} from "./index";
import type { Rule } from "@nohardtext/rule-engine";

describe("@nohardtext/detect-engine", () => {
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
            </>
          );
        }
      `
    });

    expect(result.findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1001",
      "NHT1002",
      "NHT1003",
      "NHT1004",
      "NHT1005"
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
