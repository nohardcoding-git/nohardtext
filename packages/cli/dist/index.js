#!/usr/bin/env node

// src/index.ts
import { existsSync, mkdirSync, readFileSync, statSync, readdirSync, writeFileSync } from "fs";
import { dirname, join, relative } from "path";
import { detect, getBuiltInRuleMetadata } from "@nohardtext/detect-engine";
import {
  createReportSummary
} from "@nohardtext/report-engine";
var TOOL_VERSION = "0.0.0";
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
var ALLOWED_CONFIG_KEYS = /* @__PURE__ */ new Set([
  "ignore",
  "failOn",
  "componentTextProps"
]);
function getCliBanner() {
  return "NoHardText CLI";
}
function getCliVersion() {
  return TOOL_VERSION;
}
function formatVersionOutput() {
  return `NoHardText ${getCliVersion()}`;
}
function formatHelpOutput() {
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
    "  --help, -h               Print help."
  ].join("\n");
}
function normalizeFailOn(value) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string" || !SEVERITY_ORDER.includes(value)) {
    throw new Error(
      `Invalid config field "failOn": expected one of ${SEVERITY_ORDER.join(", ")}.`
    );
  }
  return value;
}
function normalizeStringArrayField(fieldName, value) {
  if (value === void 0) {
    return void 0;
  }
  if (!Array.isArray(value)) {
    throw new Error(`Invalid config field "${fieldName}": expected string[].`);
  }
  if (value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid config field "${fieldName}": expected string[].`);
  }
  return value;
}
function assertConfigObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid config file: expected a JSON object.");
  }
  return value;
}
function validateKnownConfigFields(config) {
  for (const key of Object.keys(config)) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) {
      throw new Error(`Invalid config field "${key}": unknown field.`);
    }
  }
}
function loadConfig(cwd = process.cwd()) {
  const configPath = join(cwd, "nohardtext.config.json");
  if (!existsSync(configPath)) {
    return {};
  }
  const parsed = assertConfigObject(
    JSON.parse(readFileSync(configPath, "utf8"))
  );
  validateKnownConfigFields(parsed);
  return {
    ignore: normalizeStringArrayField("ignore", parsed.ignore),
    failOn: normalizeFailOn(parsed.failOn),
    componentTextProps: normalizeStringArrayField(
      "componentTextProps",
      parsed.componentTextProps
    )
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
function getRequiredOptionValue(args, optionName) {
  const optionIndex = args.indexOf(optionName);
  if (optionIndex < 0) {
    return void 0;
  }
  const value = args[optionIndex + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${optionName}`);
  }
  return value;
}
function parseOptions(args) {
  const failOnValue = getRequiredOptionValue(args, "--fail-on");
  const outputPath = getRequiredOptionValue(args, "--output");
  const githubAnnotations = args.includes("--github-annotations");
  if (args.includes("--json") && githubAnnotations) {
    throw new Error("Use either --json or --github-annotations, not both.");
  }
  if (failOnValue && !SEVERITY_ORDER.includes(failOnValue)) {
    throw new Error(`Invalid --fail-on severity: ${failOnValue}`);
  }
  return {
    json: args.includes("--json"),
    failOn: failOnValue,
    outputPath,
    githubAnnotations
  };
}
function stripOptions(args) {
  const result = [];
  const optionsWithValues = /* @__PURE__ */ new Set(["--fail-on", "--output"]);
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
function createScanOutput(targetPath, cwd = process.cwd(), config = {}, options = {}) {
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
  const summary = createReportSummary({ findings });
  const failOn = options.failOn ?? config.failOn;
  return {
    schemaVersion: "1.0",
    tool: {
      name: "NoHardText",
      version: TOOL_VERSION
    },
    scannedFiles: files.length,
    findings,
    summary,
    ci: {
      enabled: Boolean(failOn),
      failOn,
      passed: !shouldFail(findings, failOn)
    }
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
function escapeGithubAnnotationValue(value) {
  return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeGithubAnnotationProperty(value) {
  return escapeGithubAnnotationValue(value).replace(/,/g, "%2C").replace(/:/g, "%3A");
}
function getGithubAnnotationLevel(severity) {
  if (severity === "critical" || severity === "high") {
    return "error";
  }
  if (severity === "medium" || severity === "low") {
    return "warning";
  }
  return "notice";
}
function formatGithubAnnotationOutput(output) {
  const ruleMetadata = new Map(
    getBuiltInRuleMetadata().map((rule) => [rule.id, rule])
  );
  const lines = output.findings.map((finding) => {
    const metadata = ruleMetadata.get(finding.ruleId);
    const level = getGithubAnnotationLevel(finding.severity);
    const file = escapeGithubAnnotationProperty(finding.location.filePath);
    const title = escapeGithubAnnotationProperty(
      `${finding.ruleId}${metadata ? ` - ${metadata.name}` : ""}`
    );
    const message = escapeGithubAnnotationValue(
      `[${finding.severity}][${finding.category}] ${finding.message} ${finding.explanation}`
    );
    return `::${level} file=${file},line=${finding.location.startLine},col=${finding.location.startColumn},title=${title}::${message}`;
  });
  if (lines.length === 0) {
    lines.push("NoHardText: no findings.");
  } else {
    lines.push(
      `NoHardText: ${output.summary.totalFindings} finding(s). ${output.summary.shipReason} Score: ${output.summary.healthScore.score}/100.`
    );
  }
  return lines.join("\n");
}
function runScan(targetPath, cwd = process.cwd(), options = { json: false }, config = {}) {
  return formatScanOutput(
    createScanOutput(targetPath, cwd, config, { failOn: options.failOn }),
    options
  );
}
function runScanJson(targetPath, cwd = process.cwd(), config = {}, options = {}) {
  return JSON.stringify(createScanOutput(targetPath, cwd, config, options), null, 2);
}
function writeOutputFile(outputPath, content) {
  const outputDirectory = dirname(outputPath);
  if (outputDirectory && outputDirectory !== ".") {
    mkdirSync(outputDirectory, { recursive: true });
  }
  writeFileSync(outputPath, content);
}
async function runCli(args = process.argv.slice(2)) {
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
    const options = {
      ...parsedOptions,
      failOn: parsedOptions.failOn ?? config.failOn
    };
    const output = createScanOutput(target, process.cwd(), config, {
      failOn: options.failOn
    });
    const renderedOutput = options.githubAnnotations ? formatGithubAnnotationOutput(output) : options.json ? JSON.stringify(output, null, 2) : formatScanOutput(output, options);
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
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
export {
  createScanOutput,
  formatGithubAnnotationOutput,
  formatHelpOutput,
  formatScanOutput,
  formatVersionOutput,
  getCliBanner,
  getCliVersion,
  getIgnoredDirectories,
  loadConfig,
  runCli,
  runRulesList,
  runScan,
  runScanJson,
  shouldFail,
  shouldSkipDirectory
};
