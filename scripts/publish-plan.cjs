const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const expectedTag = "rc";

const packages = [
  { name: "@nohardcoding/nohardtext-domain", dir: "packages/domain" },
  { name: "@nohardcoding/nohardtext-parser", dir: "packages/parser" },
  { name: "@nohardcoding/nohardtext-rule-engine", dir: "packages/rule-engine" },
  { name: "@nohardcoding/nohardtext-report-engine", dir: "packages/report-engine" },
  { name: "@nohardcoding/nohardtext-detect-engine", dir: "packages/detect-engine" },
  { name: "@nohardcoding/nohardtext", dir: "packages/cli" }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function quote(value) {
  return '"' + value.replace(/"/g, '\\"') + '"';
}

const rootPackage = readJson(path.join(workspaceRoot, "package.json"));
const expectedVersion = rootPackage.version;

assert(typeof expectedVersion === "string", "Root package.json must have a version.");
assert(expectedVersion.includes("-rc."), "Publish plan expects an RC version. Current version: " + expectedVersion);

console.log("NoHardText publish plan");
console.log("=======================");
console.log("");
console.log("Version: " + expectedVersion);
console.log("Recommended npm dist-tag: " + expectedTag);
console.log("");

console.log("Pre-publish validation:");
console.log("  pnpm build");
console.log("  pnpm test");
console.log("  pnpm release:version");
console.log("  pnpm release:check");
console.log("  pnpm release:pack");
console.log("  pnpm release:rc");
console.log("");

console.log("Package order:");
for (const [index, packageInfo] of packages.entries()) {
  const packageDir = path.join(workspaceRoot, packageInfo.dir);
  const packageJson = readJson(path.join(packageDir, "package.json"));

  assert(packageJson.name === packageInfo.name, "Unexpected package name in " + packageInfo.dir + ".");
  assert(packageJson.version === expectedVersion, packageInfo.name + " version mismatch.");
  assert(fs.existsSync(path.join(packageDir, "dist")), packageInfo.name + " is missing dist folder.");
  assert(packageJson.main === "dist/index.js", packageInfo.name + " main must be dist/index.js.");
  assert(packageJson.types === "dist/index.d.ts", packageInfo.name + " types must be dist/index.d.ts.");
  assert(Array.isArray(packageJson.files) && packageJson.files.includes("dist"), packageInfo.name + " files must include dist.");

  if (packageInfo.name === "@nohardcoding/nohardtext") {
    assert(packageJson.bin && packageJson.bin.nohardtext === "dist/index.js", "CLI package must expose nohardtext bin.");
  }

  console.log("  " + (index + 1) + ". " + packageInfo.name);
}

console.log("");
console.log("Manual publish commands:");
console.log("");

for (const packageInfo of packages) {
  console.log("cd " + quote(packageInfo.dir));
  console.log("pnpm publish --access public --tag " + expectedTag);
  console.log("cd " + quote(workspaceRoot));
  console.log("");
}

console.log("Post-publish checks:");
console.log("  npm view @nohardcoding/nohardtext@" + expectedVersion + " version");
console.log("  npm view @nohardcoding/nohardtext dist-tags");
console.log("");
console.log("Important:");
console.log("- Do not use the latest dist-tag for an RC.");
console.log("- Use the rc dist-tag.");
console.log("- Publish only after npm login is confirmed.");
console.log("- This script does not publish anything.");
