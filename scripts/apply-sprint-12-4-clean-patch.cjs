const fs = require("node:fs");

function readText(path) {
  return fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

function writeText(path, text) {
  fs.writeFileSync(path, text.replace(/\n/g, "\r\n"));
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  let inString = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = openBraceIndex; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === inString) {
        inString = null;
      }

      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error("Could not find matching closing brace.");
}

function replaceFirstIfBlockAfter(text, anchor, ifNeedle, replacement) {
  const anchorIndex = text.indexOf(anchor);
  if (anchorIndex < 0) {
    throw new Error(`Could not find anchor: ${anchor}`);
  }

  const blockStart = text.indexOf(ifNeedle, anchorIndex);
  if (blockStart < 0) {
    throw new Error(`Could not find block after anchor: ${ifNeedle}`);
  }

  const openBraceIndex = text.indexOf("{", blockStart);
  if (openBraceIndex < 0) {
    throw new Error("Could not find block opening brace.");
  }

  const blockEnd = findMatchingBrace(text, openBraceIndex) + 1;

  return text.slice(0, blockStart) + replacement + text.slice(blockEnd);
}

function ensureParserDynamicTemplateSupport() {
  const path = "packages/parser/src/index.ts";
  let text = readText(path);

  if (!text.includes("function getTemplateLiteralDisplayValue")) {
    const marker = "function getStaticStringFromAttributeValue";
    const markerIndex = text.indexOf(marker);

    if (markerIndex < 0) {
      throw new Error("Could not find getStaticStringFromAttributeValue.");
    }

    const helper = `function getTemplateLiteralDisplayValue(expression: any): string {
  const quasis = expression.quasis ?? [];
  const parts = quasis.map((quasi: any) => {
    return quasi?.value?.cooked ?? quasi?.value?.raw ?? "";
  });

  return parts.join("\${...}").trim();
}

`;

    text = text.slice(0, markerIndex) + helper + text.slice(markerIndex);
  }

  const attributeTemplateBlock = `  if (expression.type === "TemplateLiteral") {
    const value = getTemplateLiteralDisplayValue(expression);

    if (!value || !expression.loc) {
      return undefined;
    }

    return {
      value,
      startLine: expression.loc.start.line,
      startColumn: expression.loc.start.column + 1,
      endLine: expression.loc.end.line,
      endColumn: expression.loc.end.column + 1,
    };
  }`;

  text = replaceFirstIfBlockAfter(
    text,
    "function getStaticStringFromAttributeValue",
    '  if (expression.type === "TemplateLiteral") {',
    attributeTemplateBlock
  );

  const expressionTemplateBlock = `  if (expression.type === "TemplateLiteral") {
    const value = getTemplateLiteralDisplayValue(expression);

    if (value) {
      pushJsxExpressionString(nodes, expression, value);
    }

    return;
  }`;

  text = replaceFirstIfBlockAfter(
    text,
    "function collectExpressionStrings",
    '  if (expression.type === "TemplateLiteral") {',
    expressionTemplateBlock
  );

  if (!text.includes("export function collectJsxAttributeStringValues")) {
    throw new Error("Safety check failed: collectJsxAttributeStringValues export is missing.");
  }

  if (!text.includes("function collectExpressionStrings")) {
    throw new Error("Safety check failed: collectExpressionStrings is missing.");
  }

  writeText(path, text);
  console.log("Patched parser dynamic template literal support safely.");
}

function ensureComponentProps() {
  const path = "packages/detect-engine/src/rules/custom-component-prop.ts";
  let text = readText(path);

  const blockRegex = /const DEFAULT_COMPONENT_TEXT_PROPS = \[([\s\S]*?)\];/;
  const match = text.match(blockRegex);

  if (!match) {
    throw new Error("Could not find DEFAULT_COMPONENT_TEXT_PROPS.");
  }

  const existing = [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);

  const additions = [
    "message",
    "text",
    "tooltip",
    "errorMessage",
    "successMessage",
    "warningMessage",
    "loadingText",
    "emptyMessage",
    "heading",
    "subheading",
    "subtitle",
    "caption",
    "badgeText",
    "buttonText",
    "linkText",
    "ariaLabel",
    "accessibilityLabel",
    "screenReaderLabel",
    "emptyTitle",
    "errorTitle",
    "successTitle",
    "warningTitle",
  ];

  const next = [...new Set([...existing, ...additions])];

  const nextBlock = `const DEFAULT_COMPONENT_TEXT_PROPS = [\n${next.map((prop) => `  "${prop}"`).join(",\n")}\n];`;

  text = text.replace(blockRegex, nextBlock);
  writeText(path, text);
  console.log("Patched real-world component text props.");
}

function replaceOrInsertTest(text, testName, testBody) {
  const startNeedle = `  it("${testName}"`;
  const start = text.indexOf(startNeedle);

  if (start >= 0) {
    const nextTest = text.indexOf('\n  it("', start + startNeedle.length);
    const describeEnd = text.lastIndexOf("\n});");
    const end = nextTest >= 0 ? nextTest : describeEnd;

    if (end < 0) {
      throw new Error(`Could not find end for test: ${testName}`);
    }

    return text.slice(0, start) + testBody.trimEnd() + "\n" + text.slice(end);
  }

  const insertIndex = text.lastIndexOf("\n});");

  if (insertIndex < 0) {
    throw new Error(`Could not find describe closing block to insert test: ${testName}`);
  }

  return text.slice(0, insertIndex) + "\n" + testBody.trimEnd() + "\n" + text.slice(insertIndex);
}

function ensureScanQualityTests() {
  const path = "packages/detect-engine/src/scan-quality.test.ts";
  let text = readText(path);

  const symbolTest = `  it("does not flag non-localizable symbol and numeric tokens", () => {
    const findings = scan([
      "export default function App() {",
      "  return (",
      "    <>",
      "      <span>404</span>",
      "      <span>500</span>",
      "      <span>100%</span>",
      "      <span>v1.2.3</span>",
      "      <span>*</span>",
      "      <span>--</span>",
      "      <span>...</span>",
      "    </>",
      "  );",
      "}",
    ].join("\\n"));

    expect(findings).toEqual([]);
  });`;

  const realWorldPropsTest = `  it("detects common real-world custom component text props by default", () => {
    const findings = scan([
      "export default function App() {",
      "  return (",
      "    <>",
      "      <Toast message=\\"Saved successfully\\" />",
      "      <Tooltip text=\\"Copy link\\" />",
      "      <HelpIcon tooltip=\\"This field is required\\" />",
      "      <Alert errorMessage=\\"Something went wrong\\" />",
      "      <Alert successMessage=\\"Project created\\" />",
      "      <Alert warningMessage=\\"This action cannot be undone\\" />",
      "      <Loader loadingText=\\"Loading projects...\\" />",
      "      <EmptyState emptyMessage=\\"No projects found\\" />",
      "    </>",
      "  );",
      "}",
    ].join("\\n"));

    expect(findings.map((finding) => finding.ruleId)).toEqual(Array(8).fill("NHT1006"));

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded component prop "message" found: "Saved successfully"',
      'Hardcoded component prop "text" found: "Copy link"',
      'Hardcoded component prop "tooltip" found: "This field is required"',
      'Hardcoded component prop "errorMessage" found: "Something went wrong"',
      'Hardcoded component prop "successMessage" found: "Project created"',
      'Hardcoded component prop "warningMessage" found: "This action cannot be undone"',
      'Hardcoded component prop "loadingText" found: "Loading projects..."',
      'Hardcoded component prop "emptyMessage" found: "No projects found"',
    ]);
  });`;

  const nativePropsTest = `  it("does not flag real-world text-like props on native lowercase elements", () => {
    const findings = scan([
      "export default function App() {",
      "  return (",
      "    <>",
      "      <div message=\\"not-user-facing-native-prop\\" />",
      "      <span text=\\"not-user-facing-native-prop\\" />",
      "      <input errorMessage=\\"not-user-facing-native-prop\\" />",
      "      <section loadingText=\\"not-user-facing-native-prop\\" />",
      "    </>",
      "  );",
      "}",
    ].join("\\n"));

    expect(findings).toEqual([]);
  });`;

  const dynamicTest = `  it("detects dynamic template literal UI strings", () => {
    const findings = scan([
      "export default function App({",
      "  userName,",
      "  entityName,",
      "  resourceName,",
      "}: {",
      "  userName: string;",
      "  entityName: string;",
      "  resourceName: string;",
      "}) {",
      "  return (",
      "    <>",
      "      <h1>{\`Welcome \${userName}\`}</h1>",
      "      <input placeholder={\`Search \${entityName}\`} />",
      "      <Button label={\`Create \${resourceName}\`} />",
      "    </>",
      "  );",
      "}",
    ].join("\\n"));

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1002",
      "NHT1006",
    ]);

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Welcome \${...}"',
      'Hardcoded placeholder found: "Search \${...}"',
      'Hardcoded component prop "label" found: "Create \${...}"',
    ]);
  });`;

  const headingTest = `  it("detects common heading and accessibility component props by default", () => {
    const findings = scan([
      "export default function App() {",
      "  return (",
      "    <>",
      "      <PageHeader heading=\\"Billing settings\\" subheading=\\"Manage your plan\\" />",
      "      <Card subtitle=\\"Current usage\\" caption=\\"Updated today\\" />",
      "      <Badge badgeText=\\"New\\" />",
      "      <CTA buttonText=\\"Upgrade now\\" linkText=\\"View plans\\" />",
      "      <IconButton ariaLabel=\\"Close dialog\\" />",
      "      <IconButton accessibilityLabel=\\"Open menu\\" />",
      "      <VisuallyHidden screenReaderLabel=\\"Loading dashboard\\" />",
      "      <EmptyState emptyTitle=\\"No invoices yet\\" />",
      "      <Alert errorTitle=\\"Payment failed\\" />",
      "      <Alert successTitle=\\"Payment complete\\" />",
      "      <Alert warningTitle=\\"Payment method expires soon\\" />",
      "    </>",
      "  );",
      "}",
    ].join("\\n"));

    expect(findings.map((finding) => finding.ruleId)).toEqual(Array(14).fill("NHT1006"));

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded component prop "heading" found: "Billing settings"',
      'Hardcoded component prop "subheading" found: "Manage your plan"',
      'Hardcoded component prop "subtitle" found: "Current usage"',
      'Hardcoded component prop "caption" found: "Updated today"',
      'Hardcoded component prop "badgeText" found: "New"',
      'Hardcoded component prop "buttonText" found: "Upgrade now"',
      'Hardcoded component prop "linkText" found: "View plans"',
      'Hardcoded component prop "ariaLabel" found: "Close dialog"',
      'Hardcoded component prop "accessibilityLabel" found: "Open menu"',
      'Hardcoded component prop "screenReaderLabel" found: "Loading dashboard"',
      'Hardcoded component prop "emptyTitle" found: "No invoices yet"',
      'Hardcoded component prop "errorTitle" found: "Payment failed"',
      'Hardcoded component prop "successTitle" found: "Payment complete"',
      'Hardcoded component prop "warningTitle" found: "Payment method expires soon"',
    ]);
  });`;

  const nativeHeadingTest = `  it("does not flag heading and accessibility text props on native lowercase elements", () => {
    const findings = scan([
      "export default function App() {",
      "  return (",
      "    <>",
      "      <section heading=\\"not-user-facing-native-prop\\" />",
      "      <div subtitle=\\"not-user-facing-native-prop\\" />",
      "      <span caption=\\"not-user-facing-native-prop\\" />",
      "      <button ariaLabel=\\"not-user-facing-native-prop\\" />",
      "      <i accessibilityLabel=\\"not-user-facing-native-prop\\" />",
      "      <span screenReaderLabel=\\"not-user-facing-native-prop\\" />",
      "    </>",
      "  );",
      "}",
    ].join("\\n"));

    expect(findings).toEqual([]);
  });`;

  text = replaceOrInsertTest(text, "does not flag non-localizable symbol and numeric tokens", symbolTest);
  text = replaceOrInsertTest(text, "detects common real-world custom component text props by default", realWorldPropsTest);
  text = replaceOrInsertTest(text, "does not flag real-world text-like props on native lowercase elements", nativePropsTest);
  text = replaceOrInsertTest(text, "detects dynamic template literal UI strings", dynamicTest);
  text = replaceOrInsertTest(text, "detects common heading and accessibility component props by default", headingTest);
  text = replaceOrInsertTest(text, "does not flag heading and accessibility text props on native lowercase elements", nativeHeadingTest);

  writeText(path, text);
  console.log("Patched scan quality tests safely.");
}

ensureParserDynamicTemplateSupport();
ensureComponentProps();
ensureScanQualityTests();

console.log("Sprint 12.4 clean patch applied.");
