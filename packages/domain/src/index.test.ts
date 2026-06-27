import { describe, expect, it } from "vitest";
import type { Finding, HealthScore } from "./index";

describe("@nohardcoding/nohardtext-domain", () => {
  it("supports a finding model", () => {
    const finding: Finding = {
      id: "finding-1",
      ruleId: "NHT1001",
      severity: "high",
      category: "localization",
      message: "Hardcoded JSX text found.",
      explanation: "User-facing text should be moved to localization files.",
      location: {
        filePath: "src/App.tsx",
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 10
      },
      fixable: true,
      suggestions: [{ message: "Extract text to a translation key." }]
    };

    expect(finding.ruleId).toBe("NHT1001");
  });

  it("supports a health score model", () => {
    const score: HealthScore = {
      score: 93,
      grade: "A"
    };

    expect(score.grade).toBe("A");
  });
});
