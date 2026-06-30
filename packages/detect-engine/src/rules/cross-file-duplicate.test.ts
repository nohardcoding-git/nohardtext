import { describe, expect, it } from "vitest";
import type { Finding } from "@nohardcoding/nohardtext-domain";
import { detectCrossFileDuplicates } from "./cross-file-duplicate";

function buildFinding(filePath: string, value: string): Finding {
  return {
    id: `${filePath}:NHT1001:1:1`,
    ruleId: "NHT1001",
    severity: "high",
    category: "localization",
    message: `Hardcoded JSX text found: "${value}"`,
    explanation: "User-facing JSX text should be moved to localization files.",
    value,
    location: {
      filePath,
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 10
    },
    fixable: true,
    suggestions: []
  };
}

describe("detectCrossFileDuplicates", () => {
  it("flags the same value found in two or more distinct files", () => {
    const findings = [
      buildFinding("src/UserBadge.tsx", "Active"),
      buildFinding("src/FilterBar.tsx", "Active"),
      buildFinding("src/StatusTable.tsx", "Active")
    ];

    const result = detectCrossFileDuplicates(findings);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("NHT2001");
    expect(result[0].severity).toBe("low");
    expect(result[0].category).toBe("developer-experience");
    expect(result[0].message).toContain("Active");
    expect(result[0].message).toContain("3 files");
  });

  it("does not flag the same value repeated only within a single file", () => {
    const findings = [
      buildFinding("src/UserBadge.tsx", "Active"),
      buildFinding("src/UserBadge.tsx", "Active")
    ];

    const result = detectCrossFileDuplicates(findings);

    expect(result).toHaveLength(0);
  });

  it("does not flag values that appear in only one file", () => {
    const findings = [
      buildFinding("src/UserBadge.tsx", "Active"),
      buildFinding("src/FilterBar.tsx", "Inactive")
    ];

    const result = detectCrossFileDuplicates(findings);

    expect(result).toHaveLength(0);
  });

  it("normalizes whitespace and case when grouping, but preserves original wording for review", () => {
    const findings = [
      buildFinding("src/UserBadge.tsx", "Active"),
      buildFinding("src/FilterBar.tsx", "active ")
    ];

    const result = detectCrossFileDuplicates(findings);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("Active");
  });

  it("ignores findings with no structured value", () => {
    const withoutValue: Finding = { ...buildFinding("src/FilterBar.tsx", "Active"), value: undefined };

    const findings = [buildFinding("src/UserBadge.tsx", "Active"), withoutValue];

    const result = detectCrossFileDuplicates(findings);

    expect(result).toHaveLength(0);
  });

  it("respects a custom minOccurrences threshold", () => {
    const findings = [
      buildFinding("src/UserBadge.tsx", "Active"),
      buildFinding("src/FilterBar.tsx", "Active"),
      buildFinding("src/StatusTable.tsx", "Active")
    ];

    const result = detectCrossFileDuplicates(findings, { minOccurrences: 3 });

    expect(result).toHaveLength(1);

    const stricterResult = detectCrossFileDuplicates(findings, { minOccurrences: 4 });

    expect(stricterResult).toHaveLength(0);
  });
});
