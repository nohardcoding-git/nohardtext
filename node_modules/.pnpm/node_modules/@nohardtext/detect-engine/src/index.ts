import type { Finding } from "@nohardtext/domain";
import {
  collectJsxAttributeStringValues,
  collectJsxTextNodes
} from "@nohardtext/parser";
import { runRules, type Rule } from "@nohardtext/rule-engine";

export interface DetectInput {
  filePath: string;
  sourceText: string;
  rules?: Rule[];
}

export interface DetectResult {
  filePath: string;
  findings: Finding[];
}

export function detect(input: DetectInput): DetectResult {
  const ruleFindings = input.rules
    ? runRules(input.rules, {
        filePath: input.filePath,
        sourceText: input.sourceText
      })
    : [];

  return {
    filePath: input.filePath,
    findings: [
      ...ruleFindings,
      ...detectJsxText(input.filePath, input.sourceText),
      ...detectPlaceholderText(input.filePath, input.sourceText)
    ]
  };
}

export function detectJsxText(filePath: string, sourceText: string): Finding[] {
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

export function detectPlaceholderText(filePath: string, sourceText: string): Finding[] {
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
