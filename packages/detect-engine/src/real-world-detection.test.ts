import { describe, expect, it } from "vitest";
import { detect } from "./index";

describe("real-world detection", () => {
  it("ignores symbols and numbers while keeping user-facing text", () => {
    const sourceText = `
      export default function App() {
        return (
          <>
            <span>|</span>
            <span>2026</span>
            <span>→</span>
            <button title="×">×</button>
            <h1>Welcome</h1>
            <input placeholder="Search..." />
          </>
        );
      }
    `;

    const result = detect({
      filePath: "src/App.tsx",
      sourceText
    });

    expect(result.findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1002"
    ]);

    expect(result.findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Welcome"',
      'Hardcoded placeholder found: "Search..."'
    ]);
  });
});
