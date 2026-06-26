import { describe, expect, it } from "vitest";
import { getCliBanner, runRulesList, runScan, runScanJson } from "./index";

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
});
