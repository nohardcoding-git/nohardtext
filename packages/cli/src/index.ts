#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, statSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Finding, Severity } from "@nohardcoding/nohardtext-domain";
import { detect, getBuiltInRuleMetadata, detectCrossFileDuplicates, crossFileDuplicateRuleMetadata } from "@nohardcoding/nohardtext-detect-engine";
import {
  createReportSummary,
  type ReportSummary,
} from "@nohardcoding/nohardtext-report-engine";

const TOOL_VERSION = "0.1.0";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const DEFAULT_IGNORED_DIRECTORIES = [
  "node_modules",
  "dist",
  "coverage",
  ".git",
  ".next",
  "build",
  "out",
  ".storybook",
  "__tests__",
  "__mocks__",
  "__fixtures__",
  "tests",
  "test",
  "mocks",
  "fixtures",
  "stories",
  "demo",
  "demos",
  "examples"
];

const DEFAULT_IGNORED_FILE_PATTERNS = [
  ".stories.ts",
  ".stories.tsx",
  ".stories.js",
  ".stories.jsx",
  ".story.ts",
  ".story.tsx",
  ".story.js",
  ".story.jsx",
  ".test.ts",
  ".test.tsx",
  ".test.js",
  ".test.jsx",
  ".spec.ts",
  ".spec.tsx",
  ".spec.js",
  ".spec.jsx",
  ".demo.ts",
  ".demo.tsx",
  ".demo.js",
  ".demo.jsx",
  ".example.ts",
  ".example.tsx",
  ".example.js",
  ".example.jsx"
];

const SEVERITY_ORDER: Severity[] = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
];

const ALLOWED_CONFIG_KEYS = new Set([
  "ignore",
  "failOn",
  "componentTextProps",
]);

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
  generatedAt: string;
  scannedFiles: number;
  files: string[];
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
  githubAnnotations?: boolean;
}

export interface ScanOutputOptions {
  failOn?: Severity;
}

export function getCliBanner(): string {
  return "NoHardText CLI";
}

function getAllRuleMetadata() {
  return [...getBuiltInRuleMetadata(), crossFileDuplicateRuleMetadata];
}

export function getCliVersion(): string {
  return TOOL_VERSION;
}

export function formatVersionOutput(): string {
  return `NoHardText ${getCliVersion()}`;
}

export function formatHelpOutput(): string {
  return [
    "Usage:",
    "  nohardtext scan <path>",
    "  nohardtext scan <path> --json",
    "  nohardtext scan <path> --json --output nohardtext-report.json",
    "  nohardtext scan <path> --github-annotations --fail-on high",
    "  nohardtext scan <path> --fail-on high",
    "  nohardtext rules",
    "",
    "Options:",
    "  --json                  Print JSON report output.",
    "  --output <path>          Write output to a file.",
    "  --github-annotations    Print GitHub Actions annotation output.",
    "  --fail-on <severity>     Exit with code 1 when findings meet the threshold.",
    "  --version, -v            Print CLI version.",
    "  --help, -h               Print help.",
  ].join("\n");
}

function normalizeFailOn(value: unknown): Severity | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "string" ||
    !SEVERITY_ORDER.includes(value as Severity)
  ) {
    throw new Error(
      `Invalid config field "failOn": expected one of ${SEVERITY_ORDER.join(", ")}.`,
    );
  }

  return value as Severity;
}

function normalizeStringArrayField(
  fieldName: string,
  value: unknown,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`Invalid config field "${fieldName}": expected string[].`);
  }

  if (value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid config field "${fieldName}": expected string[].`);
  }

  return value as string[];
}

function assertConfigObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid config file: expected a JSON object.");
  }

  return value as Record<string, unknown>;
}

function validateKnownConfigFields(config: Record<string, unknown>): void {
  for (const key of Object.keys(config)) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) {
      throw new Error(`Invalid config field "${key}": unknown field.`);
    }
  }
}

export function loadConfig(cwd = process.cwd()): NoHardTextConfig {
  const configPath = join(cwd, "nohardtext.config.json");

  if (!existsSync(configPath)) {
    return {};
  }

  const parsed = assertConfigObject(
    JSON.parse(readFileSync(configPath, "utf8")),
  );

  validateKnownConfigFields(parsed);

  return {
    ignore: normalizeStringArrayField("ignore", parsed.ignore),
    failOn: normalizeFailOn(parsed.failOn),
    componentTextProps: normalizeStringArrayField(
      "componentTextProps",
      parsed.componentTextProps,
    ),
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

export function getIgnoredFilePatterns(): string[] {
  return DEFAULT_IGNORED_FILE_PATTERNS;
}

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").toLowerCase();
}

export function shouldSkipFile(
  filePath: string,
  ignoredFilePatterns = getIgnoredFilePatterns()
): boolean {
  const normalizedFilePath = normalizeFilePath(filePath);

  return ignoredFilePatterns.some((pattern) =>
    normalizedFilePath.endsWith(pattern.toLowerCase())
  );
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
    return isSupportedFile(targetPath) && !shouldSkipFile(targetPath)
      ? [targetPath]
      : [];
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

    return isSupportedFile(fullPath) && !shouldSkipFile(fullPath)
      ? [fullPath]
      : [];
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
  const githubAnnotations = args.includes("--github-annotations");

  if (args.includes("--json") && githubAnnotations) {
    throw new Error("Use either --json or --github-annotations, not both.");
  }

  if (failOnValue && !SEVERITY_ORDER.includes(failOnValue as Severity)) {
    throw new Error(`Invalid --fail-on severity: ${failOnValue}`);
  }

  return {
    json: args.includes("--json"),
    failOn: failOnValue as Severity | undefined,
    outputPath,
    githubAnnotations,
  };
}

function stripOptions(args: string[]): string[] {
  const result: string[] = [];
  const optionsWithValues = new Set(["--fail-on", "--output"]);

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json" || arg === "--github-annotations") {
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
  const rules = getAllRuleMetadata();

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
  const scannedFilePaths = files.map((filePath) => relative(cwd, filePath));

  const perFileFindings = files.flatMap((filePath) => {
    const sourceText = readFileSync(filePath, "utf8");

    return detect({
      filePath: relative(cwd, filePath),
      sourceText,
      options: {
        componentTextProps: config.componentTextProps,
      },
    }).findings;
  });

  const crossFileFindings = detectCrossFileDuplicates(perFileFindings);
  const findings = [...perFileFindings, ...crossFileFindings];

  const summary = createReportSummary({ findings });
  const failOn = options.failOn ?? config.failOn;

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    tool: {
      name: "NoHardText",
      version: TOOL_VERSION,
    },
    scannedFiles: files.length,
    files: scannedFilePaths,
    findings,
    summary,
    ci: {
      enabled: Boolean(failOn),
      failOn,
      passed: !shouldFail(findings, failOn),
    },
  };
}

function formatFindingCount(count: number): string {
  return `${count} finding${count === 1 ? "" : "s"}`;
}

function formatTopIssueLines(
  summary: ReportSummary,
  ruleMetadata: Map<string, ReturnType<typeof getBuiltInRuleMetadata>[number]>,
): string[] {
  if (summary.topIssues.length === 0) {
    return [];
  }

  const lines = ["Top issues:"];

  for (const issue of summary.topIssues) {
    const metadata = ruleMetadata.get(issue.ruleId);
    const label = metadata ? `${issue.ruleId} - ${metadata.name}` : issue.ruleId;

    lines.push(
      `  ${label}: ${formatFindingCount(issue.totalFindings)} (${issue.severity}, ${issue.category})`,
    );
    lines.push(`    Example: ${issue.exampleMessage}`);
  }

  lines.push("");

  return lines;
}

function formatRuleBreakdownLines(
  summary: ReportSummary,
  ruleMetadata: Map<string, ReturnType<typeof getBuiltInRuleMetadata>[number]>,
): string[] {
  const entries = Object.entries(summary.ruleBreakdown);

  if (entries.length === 0) {
    return [];
  }

  const lines = ["Rule breakdown:"];

  for (const [ruleId, breakdown] of entries) {
    const metadata = ruleMetadata.get(ruleId);
    const label = metadata ? `${ruleId} - ${metadata.name}` : ruleId;

    lines.push(`  ${label}: ${formatFindingCount(breakdown.totalFindings)}`);
  }

  lines.push("");

  return lines;
}

function formatCategoryBreakdownLines(summary: ReportSummary): string[] {
  const entries = Object.entries(summary.categoryBreakdown);

  if (entries.length === 0) {
    return [];
  }

  const lines = ["Category breakdown:"];

  for (const [category, breakdown] of entries) {
    lines.push(`  ${category}: ${formatFindingCount(breakdown.totalFindings)}`);
  }

  lines.push("");

  return lines;
}

export function formatScanOutput(
  output: ScanOutput,
  options: CliOptions = { json: false },
): string {
  const ruleMetadata = new Map(
    getAllRuleMetadata().map((rule) => [rule.id, rule]),
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
    ...formatTopIssueLines(summary, ruleMetadata),
    ...formatRuleBreakdownLines(summary, ruleMetadata),
    ...formatCategoryBreakdownLines(summary),
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

function escapeGithubAnnotationValue(value: string): string {
  return value
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
}

function escapeGithubAnnotationProperty(value: string): string {
  return escapeGithubAnnotationValue(value)
    .replace(/,/g, "%2C")
    .replace(/:/g, "%3A");
}

function getGithubAnnotationLevel(severity: Severity): "notice" | "warning" | "error" {
  if (severity === "critical" || severity === "high") {
    return "error";
  }

  if (severity === "medium" || severity === "low") {
    return "warning";
  }

  return "notice";
}

export function formatGithubAnnotationOutput(output: ScanOutput): string {
  const ruleMetadata = new Map(
    getAllRuleMetadata().map((rule) => [rule.id, rule]),
  );

  const lines = output.findings.map((finding) => {
    const metadata = ruleMetadata.get(finding.ruleId);
    const level = getGithubAnnotationLevel(finding.severity);
    const file = escapeGithubAnnotationProperty(finding.location.filePath);
    const title = escapeGithubAnnotationProperty(
      `${finding.ruleId}${metadata ? ` - ${metadata.name}` : ""}`,
    );
    const message = escapeGithubAnnotationValue(
      `[${finding.severity}][${finding.category}] ${finding.message} ${finding.explanation}`,
    );

    return `::${level} file=${file},line=${finding.location.startLine},col=${finding.location.startColumn},title=${title}::${message}`;
  });

  if (lines.length === 0) {
    lines.push("NoHardText: no findings.");
  } else {
    lines.push(
      `NoHardText: ${output.summary.totalFindings} finding(s). ${output.summary.shipReason} Score: ${output.summary.healthScore.score}/100.`,
    );
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

function writeOutputFile(outputPath: string, content: string): void {
  const outputDirectory = dirname(outputPath);

  if (outputDirectory && outputDirectory !== ".") {
    mkdirSync(outputDirectory, { recursive: true });
  }

  writeFileSync(outputPath, content);
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  const parsedOptions = parseOptions(args);
  const normalizedArgs = stripOptions(args);

  const [command, target = "."] = normalizedArgs;

  if (!command || command === "--help" || command === "-h") {
    console.log(formatHelpOutput());
    return;
  }

  if (command === "--version" || command === "-v") {
    console.log(formatVersionOutput());
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

    const renderedOutput = options.githubAnnotations
      ? formatGithubAnnotationOutput(output)
      : options.json
        ? JSON.stringify(output, null, 2)
        : formatScanOutput(output, options);

    if (options.outputPath) {
      writeOutputFile(options.outputPath, renderedOutput);
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
