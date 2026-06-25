import { describe, expect, it } from "vitest";
import { getCliBanner, runScan } from "./index";

describe("@nohardtext/cli", () => {
  it("returns the CLI banner", () => {
    expect(getCliBanner()).toBe("NoHardText CLI");
  });

  it("scans the basic React example", () => {
    const output = runScan("../../examples/react-basic/src", process.cwd());

    expect(output).toContain("NHT1001");
    expect(output).toContain("Welcome");
    expect(output).toContain("Start Game");
  });
});
