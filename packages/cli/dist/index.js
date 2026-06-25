#!/usr/bin/env node

// src/index.ts
import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { join, relative } from "path";
import { detect } from "@nohardtext/detect-engine";
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
function runScan(targetPath, cwd = process.cwd()) {
  const files = collectFiles(targetPath);
  const findings = files.flatMap((filePath) => {
    const sourceText = readFileSync(filePath, "utf8");
    return detect({ filePath: relative(cwd, filePath), sourceText }).findings;
  });
  const summary = createReportSummary({ findings });
  const lines = [
    getCliBanner(),
    "",
    `Scanned files: ${files.length}`,
    `Findings: ${summary.totalFindings}`,
    `Localization grade: ${summary.healthScore.grade}`,
    `Localization score: ${summary.healthScore.score}`,
    ""
  ];
  for (const finding of findings) {
    lines.push("----------------------------");
    lines.push(finding.ruleId);
    lines.push(`${finding.location.filePath}:${finding.location.startLine}:${finding.location.startColumn}`);
    lines.push(finding.message);
    lines.push(finding.explanation);
    lines.push("");
  }
  return lines.join("\n");
}
async function runCli(args = process.argv.slice(2)) {
  const [command, target = "."] = args;
  if (!command || command === "--help" || command === "-h") {
    console.log("Usage: nohardtext scan <path>");
    return;
  }
  if (command !== "scan") {
    throw new Error(`Unknown command: ${command}`);
  }
  console.log(runScan(target));
}
if (process.argv[1]?.endsWith("index.js")) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
export {
  getCliBanner,
  runCli,
  runScan
};
