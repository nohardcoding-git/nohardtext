const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const packOutputDir = path.join(workspaceRoot, ".nohardtext-pack-check");

const packages = [
  { name: "@nohardtext/domain", dir: "packages/domain", requiresBin: false },
  { name: "@nohardtext/parser", dir: "packages/parser", requiresBin: false },
  { name: "@nohardtext/rule-engine", dir: "packages/rule-engine", requiresBin: false },
  { name: "@nohardtext/detect-engine", dir: "packages/detect-engine", requiresBin: false },
  { name: "@nohardtext/report-engine", dir: "packages/report-engine", requiresBin: false },
  { name: "@nohardtext/cli", dir: "packages/cli", requiresBin: true }
];

function run(command, cwd) {
  console.log("\n> " + command);
  execSync(command, {
    cwd,
    stdio: "inherit",
    shell: true
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readPackageJson(packageDir) {
  return JSON.parse(
    fs.readFileSync(path.join(packageDir, "package.json"), "utf8")
  );
}

function validatePackage(packageInfo) {
  const packageDir = path.join(workspaceRoot, packageInfo.dir);
  const distDir = path.join(packageDir, "dist");
  const packageJson = readPackageJson(packageDir);

  console.log("\nChecking " + packageInfo.name);

  assert(packageJson.name === packageInfo.name, "Unexpected package name for " + packageInfo.dir + ".");
  assert(fs.existsSync(distDir), "Missing dist folder for " + packageInfo.name + ".");
  assert(packageJson.main === "dist/index.js", "Missing or invalid main for " + packageInfo.name + ".");
  assert(packageJson.types === "dist/index.d.ts", "Missing or invalid types for " + packageInfo.name + ".");
  assert(Array.isArray(packageJson.files), "Missing files array for " + packageInfo.name + ".");
  assert(packageJson.files.includes("dist"), "files must include dist for " + packageInfo.name + ".");

  if (packageInfo.requiresBin) {
    assert(
      packageJson.bin && packageJson.bin.nohardtext === "dist/index.js",
      "CLI package must expose nohardtext bin."
    );
  }

  run('pnpm pack --pack-destination "' + packOutputDir + '"', packageDir);
}

try {
  fs.rmSync(packOutputDir, { recursive: true, force: true });
  fs.mkdirSync(packOutputDir, { recursive: true });

  for (const packageInfo of packages) {
    validatePackage(packageInfo);
  }

  const packedFiles = fs.readdirSync(packOutputDir).filter((fileName) => fileName.endsWith(".tgz"));

  assert(packedFiles.length === packages.length, "Expected one packed tarball per package.");

  console.log("\nPacked files:");
  for (const fileName of packedFiles) {
    console.log("  " + fileName);
  }

  console.log("\nPackage pack check passed.");
} finally {
  fs.rmSync(packOutputDir, { recursive: true, force: true });
}
