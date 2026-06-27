#!/usr/bin/env node

import { existsSync, readFileSync, statSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { Finding, Severity } from "@nohardtext/domain";
import { detect, getBuiltInRuleMetadata } from "@nohardtext/detect-engine";
import {
  createReportSummary,
  type ReportSummary,
} from "@nohardtext/report-engine";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const DEFAULT_IGNORED_DIRECTORIES = [
  "node_modules",
  "dist",
  "coverage",
  ".git",
  ".next",
  "build",
  "out",
];

const SEVERITY_ORDER: Severity[] = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
];

export interface NoHardTextConfig {
  ignore?: string[];
  failOn?: Severity;
  componentTextProps?: string[];
}

export interface ScanOutput {
  schemaVersion: "1.0";
  tool: {
    name: "NoHardText";
    version: string;
  };
  scannedFiles: number;
  findings: Finding[];
  summary: ReportSummary;
  ci: {
    enabled: boolean;
    failOn?: Severity;
    passed: boolean;
  };
}

export interface CliOptions {
  json: boolean;
  failOn?: Severity;
  outputPath?: string;
}

export interface ScanOutputOptions {
  failOn?: Severity;
}

export function getCliBanner(): string {
  return "NoHardText CLI";
}

function normalizeFailOn(value: unknown): Severity | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "string" ||
    !SEVERITY_ORDER.includes(value as Severity)
  ) {
    throw new Error(`Invalid failOn severity in config: ${String(value)}`);
  }

  return value as Severity;
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item: unknown): item is string => typeof item === "string");
}

export function loadConfig(cwd = process.cwd()): NoHardTextConfig {
  const configPath = join(cwd, "nohardtext.config.json");

  if (!existsSync(configPath)) {
    return {};
  }

  const parsed = JSON.parse(readFileSync(configPath, "utf8")) as {
    ignore?: unknown;
    failOn?: unknown;
    componentTextProps?: unknown;
  };

  return {
    ignore: normalizeStringArray(parsed.ignore),
    failOn: normalizeFailOn(parsed.failOn),
    componentTextProps: normalizeStringArray(parsed.componentTextProps),
  };
}

export function getIgnoredDirectories(
  config: NoHardTextConfig = {},
): Set<string> {
  return new Set([...DEFAULT_IGNORED_DIRECTORIES, ...(config.ignore ?? [])]);
}

export function shouldSkipDirectory(
  directoryName: string,
  ignoredDirectories = getIgnoredDirectories(),
): boolean {
  return ignoredDirectories.has(directoryName);
}

function isSupportedFile(filePath: string): boolean {
  return SUPPORTED_EXTENSIONS.some((extension) => filePath.endsWith(extension));
}

function collectFiles(
  targetPath: string,
  ignoredDirectories: Set<string>,
): string[] {
  if (!existsSync(targetPath)) {
    throw new Error(`Path does not exist: ${targetPath}`);
  }

  const stat = statSync(targetPath);

  if (stat.isFile()) {
    return isSupportedFile(targetPath) ? [targetPath] : [];
  }

  return readdirSync(targetPath).flatMap((entry) => {
    if (shouldSkipDirectory(entry, ignoredDirectories)) {
      return [];
    }

    const fullPath = join(targetPath, entry);
    const entryStat = statSync(fullPath);

    if (entryStat.isDirectory()) {
      return collectFiles(fullPath, ignoredDirectories);
    }

    return isSupportedFile(fullPath) ? [fullPath] : [];
  });
}

function getRequiredOptionValue(args: string[], optionName: string): string | undefined {
  const optionIndex = args.indexOf(optionName);

  if (optionIndex < 0) {
    return undefined;
  }

  const value = args[optionIndex + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${optionName}`);
  }

  return value;
}

function parseOptions(args: string[]): CliOptions {
  const failOnValue = getRequiredOptionValue(args, "--fail-on");
  const outputPath = getRequiredOptionValue(args, "--output");

  if (failOnValue && !SEVERITY_ORDER.includes(failOnValue as Severity)) {
    throw new Error(`Invalid --fail-on severity: ${failOnValue}`);
  }

  return {
    json: args.includes("--json"),
    failOn: failOnValue as Severity | undefined,
    outputPath,
  };
}

function stripOptions(args: string[]): string[] {
  const result: string[] = [];
  const optionsWithValues = new Set(["--fail-on", "--output"]);

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json") {
      continue;
    }

    if (optionsWithValues.has(arg)) {
      index += 1;
      continue;
    }

    result.push(arg);
  }

  return result;
}

export function shouldFail(findings: Finding[], failOn?: Severity): boolean {
  if (!failOn) {
    return false;
  }

  const threshold = SEVERITY_ORDER.indexOf(failOn);

  return findings.some(
    (finding) => SEVERITY_ORDER.indexOf(finding.severity) >= threshold,
  );
}

export function runRulesList(): string {
  const rules = getBuiltInRuleMetadata();

  const lines = [getCliBanner(), "", "Supported rules:", ""];

  for (const rule of rules) {
    lines.push(`${rule.id}  ${rule.name}`);
    lines.push(`  Category: ${rule.category}`);
    lines.push(`  Severity: ${rule.severity}`);
    lines.push(`  Fixable: ${rule.fixable ? "yes" : "no"}`);
    lines.push(`  ${rule.description}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function createScanOutput(
  targetPath: string,
  cwd = process.cwd(),
  config: NoHardTextConfig = {},
  options: ScanOutputOptions = {},
): ScanOutput {
  const ignoredDirectories = getIgnoredDirectories(config);
  const files = collectFiles(targetPath, ignoredDirectories);

  const findings = files.flatMap((filePath) => {
    const sourceText = readFileSync(filePath, "utf8");

    return detect({
      filePath: relative(cwd, filePath),
      sourceText,
      options: {
        componentTextProps: config.componentTextProps,
      },
    }).findings;
  });

  const summary = createReportSummary({ findings });
  const failOn = options.failOn ?? config.failOn;

  return {
    schemaVersion: "1.0",
    tool: {
      name: "NoHardText",
      version: "0.0.0",
    },
    scannedFiles: files.length,
    findings,
    summary,
    ci: {
      enabled: Boolean(failOn),
      failOn,
      passed: !shouldFail(findings, failOn),
    },
  };
}

export function formatScanOutput(
  output: ScanOutput,
  options: CliOptions = { json: false },
): string {
  const ruleMetadata = new Map(
    getBuiltInRuleMetadata().map((rule) => [rule.id, rule]),
  );

  const summary = output.summary;

  const lines = [
    getCliBanner(),
    "",
    `Scanned files: ${output.scannedFiles}`,
    `Findings: ${summary.totalFindings}`,
    `Can I ship? ${summary.shipDecision === "yes" ? "Yes" : summary.shipDecision === "warning" ? "With warnings" : "No"}`,
    `Reason: ${summary.shipReason}`,
    `Localization grade: ${summary.healthScore.grade}`,
    `Localization score: ${summary.healthScore.score} / 100`,
    "",
  ];

  if (output.ci.enabled && output.ci.failOn) {
    lines.push(`Fail on: ${output.ci.failOn}`);
    lines.push(`CI result: ${output.ci.passed ? "passed" : "failed"}`);
    lines.push("");
  }

  for (const finding of output.findings) {
    const metadata = ruleMetadata.get(finding.ruleId);

    lines.push("----------------------------");
    lines.push(`${finding.ruleId}${metadata ? ` - ${metadata.name}` : ""}`);
    lines.push(
      `${finding.location.filePath}:${finding.location.startLine}:${finding.location.startColumn}`,
    );
    lines.push(`Severity: ${finding.severity}`);
    lines.push(`Category: ${finding.category}`);
    lines.push(finding.message);
    lines.push(finding.explanation);
    lines.push("");
  }

  return lines.join("\n");
}

export function runScan(
  targetPath: string,
  cwd = process.cwd(),
  options: CliOptions = { json: false },
  config: NoHardTextConfig = {},
): string {
  return formatScanOutput(
    createScanOutput(targetPath, cwd, config, { failOn: options.failOn }),
    options,
  );
}

export function runScanJson(
  targetPath: string,
  cwd = process.cwd(),
  config: NoHardTextConfig = {},
  options: ScanOutputOptions = {},
): string {
  return JSON.stringify(createScanOutput(targetPath, cwd, config, options), null, 2);
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  const parsedOptions = parseOptions(args);
  const normalizedArgs = stripOptions(args);

  const [command, target = "."] = normalizedArgs;

  if (!command || command === "--help" || command === "-h") {
    console.log("Usage:");
    console.log("  nohardtext scan <path>");
    console.log("  nohardtext scan <path> --json");
    console.log("  nohardtext scan <path> --json --output nohardtext-report.json");
    console.log("  nohardtext scan <path> --fail-on high");
    console.log("  nohardtext rules");
    return;
  }

  if (command === "rules") {
    console.log(runRulesList());
    return;
  }

  if (command === "scan") {
    const config = loadConfig(process.cwd());
    const options: CliOptions = {
      ...parsedOptions,
      failOn: parsedOptions.failOn ?? config.failOn,
    };

    const output = createScanOutput(target, process.cwd(), config, {
      failOn: options.failOn,
    });

    const renderedOutput = options.json
      ? JSON.stringify(output, null, 2)
      : formatScanOutput(output, options);

    if (options.outputPath) {
      writeFileSync(options.outputPath, renderedOutput);
    } else {
      console.log(renderedOutput);
    }

    if (!output.ci.passed) {
      process.exitCode = 1;
    }

    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1]?.endsWith("index.js")) {
  runCli().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
