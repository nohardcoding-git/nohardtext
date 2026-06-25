// src/index.ts
import {
  collectJsxAttributeStringValues,
  collectJsxTextNodes
} from "@nohardtext/parser";
import { runRules } from "@nohardtext/rule-engine";
function detect(input) {
  const ruleFindings = input.rules ? runRules(input.rules, {
    filePath: input.filePath,
    sourceText: input.sourceText
  }) : [];
  return {
    filePath: input.filePath,
    findings: [
      ...ruleFindings,
      ...detectJsxText(input.filePath, input.sourceText),
      ...detectPlaceholderText(input.filePath, input.sourceText)
    ]
  };
}
function detectJsxText(filePath, sourceText) {
  return collectJsxTextNodes(sourceText).map((node, index) => ({
    id: `${filePath}:NHT1001:${node.startLine}:${node.startColumn}:${index}`,
    ruleId: "NHT1001",
    severity: "high",
    category: "localization",
    message: `Hardcoded JSX text found: "${node.text}"`,
    explanation: "User-facing JSX text should be moved to localization files.",
    location: {
      filePath,
      startLine: node.startLine,
      startColumn: node.startColumn,
      endLine: node.endLine,
      endColumn: node.endColumn
    },
    fixable: true,
    suggestions: [{ message: "Extract this text to a localization key." }]
  }));
}
function detectPlaceholderText(filePath, sourceText) {
  return collectJsxAttributeStringValues(sourceText, ["placeholder"]).map((node, index) => ({
    id: `${filePath}:NHT1002:${node.startLine}:${node.startColumn}:${index}`,
    ruleId: "NHT1002",
    severity: "high",
    category: "localization",
    message: `Hardcoded placeholder found: "${node.value}"`,
    explanation: "User-facing placeholder text should be moved to localization files.",
    location: {
      filePath,
      startLine: node.startLine,
      startColumn: node.startColumn,
      endLine: node.endLine,
      endColumn: node.endColumn
    },
    fixable: true,
    suggestions: [{ message: "Extract this placeholder to a localization key." }]
  }));
}
export {
  detect,
  detectJsxText,
  detectPlaceholderText
};
