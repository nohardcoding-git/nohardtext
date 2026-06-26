import { describe, expect, it } from "vitest";
import {
  detect,
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
    expect(findings[0]?.message).toContain("Welcome");
    expect(findings[1]?.message).toContain("Start Game");
  });

  it("detects hardcoded placeholder text", () => {
    const findings = detectPlaceholderText(
      "src/App.tsx",
      `export default function App() { return <input placeholder="Search..." />; }`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("NHT1002");
    expect(findings[0]?.message).toContain("Search...");
  });

  it("detects hardcoded title attribute text", () => {
    const findings = detectTitleAttributeText(
      "src/App.tsx",
      `export default function App() { return <button title="Start the game">Start Game</button>; }`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("NHT1003");
    expect(findings[0]?.message).toContain("Start the game");
  });

  it("detects JSX text, placeholder, and title together", () => {
    const result = detect({
      filePath: "src/App.tsx",
      sourceText: `
        export default function App() {
          return (
            <>
              <h1>Welcome</h1>
              <button title="Start the game">Start Game</button>
              <input placeholder="Search..." />
            </>
          );
        }
      `
    });

    expect(result.findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1001",
      "NHT1002",
      "NHT1003"
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
