const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const tempDir = path.join(workspaceRoot, ".nohardtext-release-check");
const sourceDir = path.join(tempDir, "src");
const sourceFile = path.join(sourceDir, "App.tsx");
const jsonReportPath = path.join(tempDir, "report.json");
const annotationsPath = path.join(tempDir, "github-annotations.txt");

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

function prepareFixture() {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(sourceDir, { recursive: true });

  fs.writeFileSync(
    sourceFile,
    [
      "export default function App() {",
      "  return <button>Save</button>;",
      "}",
      ""
    ].join("\n")
  );
}

function validateJsonReport() {
  const report = JSON.parse(fs.readFileSync(jsonReportPath, "utf8"));

  assert(report.schemaVersion === "1.0", "Expected JSON schemaVersion 1.0.");
  assert(typeof report.generatedAt === "string", "Expected generatedAt string.");
  assert(report.tool && report.tool.name === "NoHardText", "Expected NoHardText tool metadata.");
  assert(report.scannedFiles === 1, "Expected one scanned file.");
  assert(Array.isArray(report.files), "Expected files array.");
  assert(Array.isArray(report.findings), "Expected findings array.");
  assert(report.findings.length > 0, "Expected at least one finding.");
  assert(report.summary && report.summary.totalFindings === report.findings.length, "Expected matching summary total.");
  assert(Array.isArray(report.summary.topIssues), "Expected summary.topIssues array.");
}

function validateGithubAnnotations() {
  const annotations = fs.readFileSync(annotationsPath, "utf8");

  assert(annotations.includes("::error"), "Expected GitHub error annotation.");
  assert(annotations.includes("NHT1001"), "Expected NHT1001 annotation.");
  assert(annotations.includes("NoHardText:"), "Expected NoHardText summary line.");
}

try {
  prepareFixture();

  run("pnpm build");
  run("pnpm test");

  run("node packages/cli/dist/index.js --version", { silent: true });
  run("node packages/cli/dist/index.js --help", { silent: true });

  run('node packages/cli/dist/index.js scan "' + sourceDir + '" --json --output "' + jsonReportPath + '"');
  validateJsonReport();

  run('node packages/cli/dist/index.js scan "' + sourceDir + '" --github-annotations --output "' + annotationsPath + '"');
  validateGithubAnnotations();

  console.log("\nRelease check passed.");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
