import { describe, expect, it } from "vitest";
import { getBuiltInRuleMetadata } from "./registry";

describe("built-in rule registry", () => {
  it("exposes metadata for all built-in rules", () => {
    const rules = getBuiltInRuleMetadata();

    expect(rules.map((rule) => rule.id)).toEqual([
      "NHT1001",
      "NHT1002",
      "NHT1003",
      "NHT1004",
      "NHT1005",
      "NHT1006"
    ]);

    expect(rules.every((rule) => rule.fixable)).toBe(true);
  });
});
