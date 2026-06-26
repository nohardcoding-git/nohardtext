#!/usr/bin/env node

// src/index.ts
import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { join, relative } from "path";
import { detect, getBuiltInRuleMetadata } from "@nohardtext/detect-engine";
import { createReportSummary } from "@nohardtext/report-engine";
var SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
function getCliBanner() {
  return "NoHardText CLI";
}
function isSupportedFile(filePath) {
  return SUPPORTED_EXTENSIONS.some((extension) => filePath.endsWith(extension));
}
function collectFiles(targetPath) {
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
function runRulesList() {
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
function createScanOutput(targetPath, cwd = process.cwd()) {
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
function runScan(targetPath, cwd = process.cwd()) {
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
function runScanJson(targetPath, cwd = process.cwd()) {
  return JSON.stringify(createScanOutput(targetPath, cwd), null, 2);
}
async function runCli(args = process.argv.slice(2)) {
  const json = args.includes("--json");
  const normalizedArgs = args.filter((arg) => arg !== "--json");
  const [command, target = "."] = normalizedArgs;
  if (!command || command === "--help" || command === "-h") {
    console.log("Usage:");
    console.log("  nohardtext scan <path>");
    console.log("  nohardtext scan <path> --json");
    console.log("  nohardtext rules");
    return;
  }
  if (command === "rules") {
    console.log(runRulesList());
    return;
  }
  if (command === "scan") {
    console.log(json ? runScanJson(target) : runScan(target));
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
  getCliBanner,
  runCli,
  runRulesList,
  runScan,
  runScanJson
};
