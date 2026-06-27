import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getCliBanner,
  getIgnoredDirectories,
  loadConfig,
  runRulesList,
  runScan,
  runScanJson,
  runCli,
  shouldFail,
  shouldSkipDirectory,
} from "./index";
import type { Finding } from "@nohardtext/domain";

describe("@nohardtext/cli", () => {
  it("returns the CLI banner", () => {
    expect(getCliBanner()).toBe("NoHardText CLI");
  });

  it("loads nohardtext config", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      writeFileSync(
        join(dir, "nohardtext.config.json"),
        JSON.stringify({
          ignore: ["storybook-static"],
          failOn: "high",
          componentTextProps: ["message", "text"],
        }),
      );

      const config = loadConfig(dir);

      expect(config.ignore).toEqual(["storybook-static"]);
      expect(config.failOn).toBe("high");
      expect(config.componentTextProps).toEqual(["message", "text"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("skips generated and dependency directories", () => {
    expect(shouldSkipDirectory("node_modules")).toBe(true);
    expect(shouldSkipDirectory("dist")).toBe(true);
    expect(shouldSkipDirectory(".git")).toBe(true);
    expect(shouldSkipDirectory("src")).toBe(false);
  });

  it("supports custom ignored directories from config", () => {
    const ignoredDirectories = getIgnoredDirectories({
      ignore: ["storybook-static"],
    });

    expect(shouldSkipDirectory("storybook-static", ignoredDirectories)).toBe(
      true,
    );
    expect(shouldSkipDirectory("src", ignoredDirectories)).toBe(false);
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

    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.tool).toEqual({
      name: "NoHardText",
      version: "0.0.0",
    });

    expect(parsed.ci).toEqual({
      enabled: false,
      passed: true,
    });

    expect(parsed.scannedFiles).toBe(1);
    expect(parsed.findings.length).toBeGreaterThan(0);
    expect(parsed.summary.totalFindings).toBe(parsed.findings.length);
  });

  it("returns CI metadata in JSON scan output", () => {
    const output = runScanJson("../../examples/react-basic/src", process.cwd(), {}, {
      failOn: "high",
    });
    const parsed = JSON.parse(output);

    expect(parsed.ci).toEqual({
      enabled: true,
      failOn: "high",
      passed: false,
    });
  });

  it("writes scan output to a file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      const sourcePath = join(dir, "App.tsx");
      const outputPath = join(dir, "nohardtext-report.json");

      writeFileSync(
        sourcePath,
        `
          export default function App() {
            return <button>Save</button>;
          }
        `,
      );

      await runCli(["scan", sourcePath, "--json", "--output", outputPath]);

      expect(existsSync(outputPath)).toBe(true);

      const parsed = JSON.parse(readFileSync(outputPath, "utf8"));

      expect(parsed.schemaVersion).toBe("1.0");
      expect(parsed.tool.name).toBe("NoHardText");
      expect(parsed.scannedFiles).toBe(1);
      expect(parsed.findings.length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects CI failure threshold", () => {
    const findings = [
      {
        severity: "high",
      },
    ] as Finding[];

    expect(shouldFail(findings, "critical")).toBe(false);
    expect(shouldFail(findings, "high")).toBe(true);
    expect(shouldFail(findings, "medium")).toBe(true);
  });

  it("uses component text props from config", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      writeFileSync(
        join(dir, "App.tsx"),
        `
        export default function App() {
          return (
            <>
              <Toast message="Saved successfully" />
              <Badge text="New" />
            </>
          );
        }
      `,
      );

      const output = runScan(
        join(dir, "App.tsx"),
        dir,
        { json: false },
        {
          componentTextProps: ["message", "text"],
        },
      );

      expect(output).toContain(
        'Hardcoded component prop "message" found: "Saved successfully"',
      );
      expect(output).toContain('Hardcoded component prop "text" found: "New"');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
