import { describe, expect, it } from "vitest";
import { getCliBanner, runRulesList, runScan, runScanJson, shouldFail } from "./index";
import type { Finding } from "@nohardtext/domain";

describe("@nohardtext/cli", () => {
  it("returns the CLI banner", () => {
    expect(getCliBanner()).toBe("NoHardText CLI");
  });

  it("lists supported rules", () => {
    const output = runRulesList();

    expect(output).toContain("NHT1001");
    expect(output).toContain("JSX Text");
    expect(output).toContain("NHT1005");
    expect(output).toContain("Alt Attribute");
  });

  it("scans the basic React example", () => {
    const output = runScan("../../examples/react-basic/src", process.cwd());

    expect(output).toContain("NHT1001");
    expect(output).toContain("Welcome");
    expect(output).toContain("Start Game");
    expect(output).toContain("Can I ship?");
  });

  it("returns JSON scan output", () => {
    const output = runScanJson("../../examples/react-basic/src", process.cwd());
    const parsed = JSON.parse(output);

    expect(parsed.scannedFiles).toBe(1);
    expect(parsed.findings.length).toBeGreaterThan(0);
    expect(parsed.summary.totalFindings).toBe(parsed.findings.length);
  });

  it("detects CI failure threshold", () => {
    const findings = [
      {
        severity: "high"
      }
    ] as Finding[];

    expect(shouldFail(findings, "critical")).toBe(false);
    expect(shouldFail(findings, "high")).toBe(true);
    expect(shouldFail(findings, "medium")).toBe(true);
  });
});
