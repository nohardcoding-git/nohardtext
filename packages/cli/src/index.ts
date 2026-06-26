#!/usr/bin/env node

import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import type { Finding, Severity } from "@nohardtext/domain";
import { detect, getBuiltInRuleMetadata } from "@nohardtext/detect-engine";
import { createReportSummary, type ReportSummary } from "@nohardtext/report-engine";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const SEVERITY_ORDER: Severity[] = ["info", "low", "medium", "high", "critical"];

export interface ScanOutput {
  scannedFiles: number;
  findings: Finding[];
  summary: ReportSummary;
}

export interface CliOptions {
  json: boolean;
  failOn?: Severity;
}

export function getCliBanner(): string {
  return "NoHardText CLI";
}

function isSupportedFile(filePath: string): boolean {
  return SUPPORTED_EXTENSIONS.some((extension) => filePath.endsWith(extension));
}

function collectFiles(targetPath: string): string[] {
  if (!existsSync(targetPath)) {
    throw new Error(`Path does not exist: ${targetPath}`);
  }

  const stat = statSync(targetPath);

  if (stat.isFile()) {
    return isSupportedFile(targetPath) ? [targetPath] : [];
  }

  return readdirSync(targetPath).flatMap((entry) => {
    const fullPath = join(targetPath, entry);
    const entryStat = statSync(fullPath);

    if (entryStat.isDirectory()) {
      return collectFiles(fullPath);
    }

    return isSupportedFile(fullPath) ? [fullPath] : [];
  });
}

function parseOptions(args: string[]): CliOptions {
  const failOnIndex = args.indexOf("--fail-on");
  const failOnValue = failOnIndex >= 0 ? args[failOnIndex + 1] : undefined;

  if (failOnValue && !SEVERITY_ORDER.includes(failOnValue as Severity)) {
    throw new Error(`Invalid --fail-on severity: ${failOnValue}`);
  }

  return {
    json: args.includes("--json"),
    failOn: failOnValue as Severity | undefined
  };
}

function stripOptions(args: string[]): string[] {
  const result: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json") {
      continue;
    }

    if (arg === "--fail-on") {
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

  return findings.some((finding) => SEVERITY_ORDER.indexOf(finding.severity) >= threshold);
}

export function runRulesList(): string {
  const rules = getBuiltInRuleMetadata();

  const lines = [
    getCliBanner(),
    "",
    "Supported rules:",
    ""
  ];

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

export function createScanOutput(targetPath: string, cwd = process.cwd()): ScanOutput {
  const files = collectFiles(targetPath);

  const findings = files.flatMap((filePath) => {
    const sourceText = readFileSync(filePath, "utf8");

    return detect({
      filePath: relative(cwd, filePath),
      sourceText
    }).findings;
  });

  return {
    scannedFiles: files.length,
    findings,
    summary: createReportSummary({ findings })
  };
}

export function runScan(targetPath: string, cwd = process.cwd(), options: CliOptions = { json: false }): string {
  const ruleMetadata = new Map(
    getBuiltInRuleMetadata().map((rule) => [rule.id, rule])
  );

  const output = createScanOutput(targetPath, cwd);
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
    ""
  ];

  if (options.failOn) {
    lines.push(`Fail on: ${options.failOn}`);
    lines.push(`CI result: ${shouldFail(output.findings, options.failOn) ? "failed" : "passed"}`);
    lines.push("");
  }

  for (const finding of output.findings) {
    const metadata = ruleMetadata.get(finding.ruleId);

    lines.push("----------------------------");
    lines.push(`${finding.ruleId}${metadata ? ` - ${metadata.name}` : ""}`);
    lines.push(`${finding.location.filePath}:${finding.location.startLine}:${finding.location.startColumn}`);
    lines.push(`Severity: ${finding.severity}`);
    lines.push(`Category: ${finding.category}`);
    lines.push(finding.message);
    lines.push(finding.explanation);
    lines.push("");
  }

  return lines.join("\n");
}

export function runScanJson(targetPath: string, cwd = process.cwd()): string {
  return JSON.stringify(createScanOutput(targetPath, cwd), null, 2);
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  const options = parseOptions(args);
  const normalizedArgs = stripOptions(args);

  const [command, target = "."] = normalizedArgs;

  if (!command || command === "--help" || command === "-h") {
    console.log("Usage:");
    console.log("  nohardtext scan <path>");
    console.log("  nohardtext scan <path> --json");
    console.log("  nohardtext scan <path> --fail-on high");
    console.log("  nohardtext rules");
    return;
  }

  if (command === "rules") {
    console.log(runRulesList());
    return;
  }

  if (command === "scan") {
    const output = createScanOutput(target);

    console.log(options.json ? JSON.stringify(output, null, 2) : runScan(target, process.cwd(), options));

    if (shouldFail(output.findings, options.failOn)) {
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
