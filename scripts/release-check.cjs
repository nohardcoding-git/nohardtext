const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const tempDir = path.join(workspaceRoot, ".nohardtext-release-check");

const dirtySourceDir = path.join(tempDir, "dirty-src");
const dirtySourceFile = path.join(dirtySourceDir, "App.tsx");
const dirtyJsonReportPath = path.join(tempDir, "dirty-report.json");
const dirtyAnnotationsPath = path.join(tempDir, "github-annotations.txt");

const cleanSourceDir = path.join(tempDir, "clean-src");
const cleanSourceFile = path.join(cleanSourceDir, "App.tsx");
const cleanJsonReportPath = path.join(tempDir, "clean-report.json");

function run(command, options = {}) {
  console.log("\n> " + command);

  execSync(command, {
    cwd: workspaceRoot,
    stdio: options.silent ? "pipe" : "inherit",
    shell: true
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function prepareFixtures() {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(dirtySourceDir, { recursive: true });
  fs.mkdirSync(cleanSourceDir, { recursive: true });

  fs.writeFileSync(
    dirtySourceFile,
    [
      "export default function App() {",
      "  return <button>Save</button>;",
      "}",
      ""
    ].join("\n")
  );

  fs.writeFileSync(
    cleanSourceFile,
    [
      "export default function App() {",
      "  return <button>{t(\"actions.save\")}</button>;",
      "}",
      ""
    ].join("\n")
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateBaseJsonReport(report) {
  assert(report.schemaVersion === "1.0", "Expected JSON schemaVersion 1.0.");
  assert(typeof report.generatedAt === "string", "Expected generatedAt string.");
  assert(report.tool && report.tool.name === "NoHardText", "Expected NoHardText tool metadata.");
  assert(typeof report.scannedFiles === "number", "Expected scannedFiles number.");
  assert(Array.isArray(report.files), "Expected files array.");
  assert(Array.isArray(report.findings), "Expected findings array.");
  assert(report.summary && typeof report.summary.totalFindings === "number", "Expected summary total.");
  assert(Array.isArray(report.summary.topIssues), "Expected summary.topIssues array.");
  assert(report.summary.ruleBreakdown && typeof report.summary.ruleBreakdown === "object", "Expected ruleBreakdown object.");
  assert(report.summary.categoryBreakdown && typeof report.summary.categoryBreakdown === "object", "Expected categoryBreakdown object.");
}

function validateDirtyJsonReport() {
  const report = readJson(dirtyJsonReportPath);

  validateBaseJsonReport(report);

  assert(report.scannedFiles === 1, "Expected one dirty scanned file.");
  assert(report.findings.length > 0, "Expected dirty fixture to produce findings.");
  assert(report.summary.totalFindings === report.findings.length, "Expected matching dirty summary total.");
  assert(report.summary.topIssues.length > 0, "Expected dirty report top issues.");
  assert(report.summary.shipDecision === "no", "Expected dirty report shipDecision no.");
}

function validateCleanJsonReport() {
  const report = readJson(cleanJsonReportPath);

  validateBaseJsonReport(report);

  assert(report.scannedFiles === 1, "Expected one clean scanned file.");
  assert(report.findings.length === 0, "Expected clean fixture to produce zero findings.");
  assert(report.summary.totalFindings === 0, "Expected clean summary total to be zero.");
  assert(report.summary.topIssues.length === 0, "Expected clean report to have no top issues.");
  assert(report.summary.shipDecision === "yes", "Expected clean report shipDecision yes.");
}

function validateGithubAnnotations() {
  const annotations = fs.readFileSync(dirtyAnnotationsPath, "utf8");

  assert(annotations.includes("::error"), "Expected GitHub error annotation.");
  assert(annotations.includes("NHT1001"), "Expected NHT1001 annotation.");
  assert(annotations.includes("NoHardText:"), "Expected NoHardText summary line.");
}

try {
  prepareFixtures();

  run("pnpm build");
  run("pnpm test");

  run("node packages/cli/dist/index.js --version", { silent: true });
  run("node packages/cli/dist/index.js --help", { silent: true });

  run('node packages/cli/dist/index.js scan "' + dirtySourceDir + '" --json --output "' + dirtyJsonReportPath + '"');
  validateDirtyJsonReport();

  run('node packages/cli/dist/index.js scan "' + cleanSourceDir + '" --json --output "' + cleanJsonReportPath + '"');
  validateCleanJsonReport();

  run('node packages/cli/dist/index.js scan "' + dirtySourceDir + '" --github-annotations --output "' + dirtyAnnotationsPath + '"');
  validateGithubAnnotations();

  console.log("\nRelease check passed.");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
