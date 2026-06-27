import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatGithubAnnotationOutput,
  formatHelpOutput,
  formatVersionOutput,
  getCliBanner,
  getCliVersion,
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

  it("returns the CLI version", () => {
    expect(getCliVersion()).toBe("0.1.0-rc.1");
  });

  it("formats version output", () => {
    expect(formatVersionOutput()).toBe("NoHardText 0.1.0-rc.1");
  });

  it("formats help output", () => {
    const output = formatHelpOutput();

    expect(output).toContain("Usage:");
    expect(output).toContain("nohardtext scan <path> --json");
    expect(output).toContain("--github-annotations");
    expect(output).toContain("--version, -v");
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

  it("throws for unknown config fields", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      writeFileSync(
        join(dir, "nohardtext.config.json"),
        JSON.stringify({
          unknownField: true,
        }),
      );

      expect(() => loadConfig(dir)).toThrow(
        'Invalid config field "unknownField": unknown field.',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when ignore is not a string array", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      writeFileSync(
        join(dir, "nohardtext.config.json"),
        JSON.stringify({
          ignore: "dist",
        }),
      );

      expect(() => loadConfig(dir)).toThrow(
        'Invalid config field "ignore": expected string[].',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when componentTextProps is not a string array", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      writeFileSync(
        join(dir, "nohardtext.config.json"),
        JSON.stringify({
          componentTextProps: ["message", 123],
        }),
      );

      expect(() => loadConfig(dir)).toThrow(
        'Invalid config field "componentTextProps": expected string[].',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws for invalid config failOn severity", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      writeFileSync(
        join(dir, "nohardtext.config.json"),
        JSON.stringify({
          failOn: "blocker",
        }),
      );

      expect(() => loadConfig(dir)).toThrow(
        'Invalid config field "failOn": expected one of info, low, medium, high, critical.',
      );
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

  it("shows rule and category breakdowns in human scan output", () => {
    const output = runScan("../../examples/react-basic/src", process.cwd());

    expect(output).toContain("Top issues:");
    expect(output).toContain("NHT1001 - JSX Text:");
    expect(output).toContain("Example:");
    expect(output).toContain("Rule breakdown:");
    expect(output).toContain("NHT1001 - JSX Text:");
    expect(output).toContain("Category breakdown:");
    expect(output).toContain("localization:");
  });

  it("returns JSON scan output", () => {
    const output = runScanJson("../../examples/react-basic/src", process.cwd());
    const parsed = JSON.parse(output);

    expect(parsed.schemaVersion).toBe("1.0");
    expect(typeof parsed.generatedAt).toBe("string");
    expect(Number.isNaN(Date.parse(parsed.generatedAt))).toBe(false);
    expect(parsed.tool).toEqual({
      name: "NoHardText",
      version: "0.1.0-rc.1",
    });

    expect(parsed.ci).toEqual({
      enabled: false,
      passed: true,
    });

    expect(parsed.scannedFiles).toBe(1);
    expect(parsed.files).toHaveLength(1);
    expect(parsed.files[0]).toContain("App.tsx");
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

  it("formats GitHub annotation output", () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      const sourcePath = join(dir, "App.tsx");

      writeFileSync(
        sourcePath,
        `
          export default function App() {
            return <button>Save</button>;
          }
        `,
      );

      const output = JSON.parse(runScanJson(sourcePath, dir));
      const annotations = formatGithubAnnotationOutput(output);

      expect(annotations).toContain("::error file=App.tsx");
      expect(annotations).toContain("title=NHT1001 - JSX Text");
      expect(annotations).toContain("NoHardText:");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes scan output to a nested output file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      const sourcePath = join(dir, "App.tsx");
      const outputPath = join(dir, "reports", "nohardtext", "report.json");

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
      expect(parsed.scannedFiles).toBe(1);
      expect(parsed.findings.length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes GitHub annotation output to a file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nohardtext-"));

    try {
      const sourcePath = join(dir, "App.tsx");
      const outputPath = join(dir, "github-annotations.txt");

      writeFileSync(
        sourcePath,
        `
          export default function App() {
            return <button>Save</button>;
          }
        `,
      );

      await runCli([
        "scan",
        sourcePath,
        "--github-annotations",
        "--output",
        outputPath,
      ]);

      const content = readFileSync(outputPath, "utf8");

      expect(content).toContain("App.tsx");
      expect(content).toContain("title=NHT1001 - JSX Text");
      expect(content).toContain("NoHardText:");
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
