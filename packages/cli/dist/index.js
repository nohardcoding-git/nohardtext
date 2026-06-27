#!/usr/bin/env node

// src/index.ts
import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { join, relative } from "path";
import { detect, getBuiltInRuleMetadata } from "@nohardtext/detect-engine";
import {
  createReportSummary
} from "@nohardtext/report-engine";
var SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
var DEFAULT_IGNORED_DIRECTORIES = [
  "node_modules",
  "dist",
  "coverage",
  ".git",
  ".next",
  "build",
  "out"
];
var SEVERITY_ORDER = [
  "info",
  "low",
  "medium",
  "high",
  "critical"
];
function getCliBanner() {
  return "NoHardText CLI";
}
function normalizeFailOn(value) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string" || !SEVERITY_ORDER.includes(value)) {
    throw new Error(`Invalid failOn severity in config: ${String(value)}`);
  }
  return value;
}
function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  return value.filter((item) => typeof item === "string");
}
function loadConfig(cwd = process.cwd()) {
  const configPath = join(cwd, "nohardtext.config.json");
  if (!existsSync(configPath)) {
    return {};
  }
  const parsed = JSON.parse(readFileSync(configPath, "utf8"));
  return {
    ignore: normalizeStringArray(parsed.ignore),
    failOn: normalizeFailOn(parsed.failOn),
    componentTextProps: normalizeStringArray(parsed.componentTextProps)
  };
}
function getIgnoredDirectories(config = {}) {
  return /* @__PURE__ */ new Set([...DEFAULT_IGNORED_DIRECTORIES, ...config.ignore ?? []]);
}
function shouldSkipDirectory(directoryName, ignoredDirectories = getIgnoredDirectories()) {
  return ignoredDirectories.has(directoryName);
}
function isSupportedFile(filePath) {
  return SUPPORTED_EXTENSIONS.some((extension) => filePath.endsWith(extension));
}
function collectFiles(targetPath, ignoredDirectories) {
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
function parseOptions(args) {
  const failOnIndex = args.indexOf("--fail-on");
  const failOnValue = failOnIndex >= 0 ? args[failOnIndex + 1] : void 0;
  if (failOnIndex >= 0 && (!failOnValue || failOnValue.startsWith("--"))) {
    throw new Error("Missing value for --fail-on");
  }
  if (failOnValue && !SEVERITY_ORDER.includes(failOnValue)) {
    throw new Error(`Invalid --fail-on severity: ${failOnValue}`);
  }
  return {
    json: args.includes("--json"),
    failOn: failOnValue
  };
}
function stripOptions(args) {
  const result = [];
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
function shouldFail(findings, failOn) {
  if (!failOn) {
    return false;
  }
  const threshold = SEVERITY_ORDER.indexOf(failOn);
  return findings.some(
    (finding) => SEVERITY_ORDER.indexOf(finding.severity) >= threshold
  );
}
function runRulesList() {
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
function createScanOutput(targetPath, cwd = process.cwd(), config = {}) {
  const ignoredDirectories = getIgnoredDirectories(config);
  const files = collectFiles(targetPath, ignoredDirectories);
  const findings = files.flatMap((filePath) => {
    const sourceText = readFileSync(filePath, "utf8");
    return detect({
      filePath: relative(cwd, filePath),
      sourceText,
      options: {
        componentTextProps: config.componentTextProps
      }
    }).findings;
  });
  return {
    scannedFiles: files.length,
    findings,
    summary: createReportSummary({ findings })
  };
}
function formatScanOutput(output, options = { json: false }) {
  const ruleMetadata = new Map(
    getBuiltInRuleMetadata().map((rule) => [rule.id, rule])
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
    ""
  ];
  if (options.failOn) {
    lines.push(`Fail on: ${options.failOn}`);
    lines.push(
      `CI result: ${shouldFail(output.findings, options.failOn) ? "failed" : "passed"}`
    );
    lines.push("");
  }
  for (const finding of output.findings) {
    const metadata = ruleMetadata.get(finding.ruleId);
    lines.push("----------------------------");
    lines.push(`${finding.ruleId}${metadata ? ` - ${metadata.name}` : ""}`);
    lines.push(
      `${finding.location.filePath}:${finding.location.startLine}:${finding.location.startColumn}`
    );
    lines.push(`Severity: ${finding.severity}`);
    lines.push(`Category: ${finding.category}`);
    lines.push(finding.message);
    lines.push(finding.explanation);
    lines.push("");
  }
  return lines.join("\n");
}
function runScan(targetPath, cwd = process.cwd(), options = { json: false }, config = {}) {
  return formatScanOutput(createScanOutput(targetPath, cwd, config), options);
}
function runScanJson(targetPath, cwd = process.cwd(), config = {}) {
  return JSON.stringify(createScanOutput(targetPath, cwd, config), null, 2);
}
async function runCli(args = process.argv.slice(2)) {
  const parsedOptions = parseOptions(args);
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
    const config = loadConfig(process.cwd());
    const options = {
      ...parsedOptions,
      failOn: parsedOptions.failOn ?? config.failOn
    };
    const output = createScanOutput(target, process.cwd(), config);
    console.log(
      options.json ? JSON.stringify(output, null, 2) : formatScanOutput(output, options)
    );
    if (shouldFail(output.findings, options.failOn)) {
      process.exitCode = 1;
    }
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}
if (process.argv[1]?.endsWith("index.js")) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
export {
  createScanOutput,
  formatScanOutput,
  getCliBanner,
  getIgnoredDirectories,
  loadConfig,
  runCli,
  runRulesList,
  runScan,
  runScanJson,
  shouldFail,
  shouldSkipDirectory
};
