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

interface AttributeRuleConfig {
  attributeName: string;
  ruleId: string;
  messagePrefix: string;
  explanation: string;
  suggestion: string;
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
      ...detectPlaceholderText(input.filePath, input.sourceText),
      ...detectTitleAttributeText(input.filePath, input.sourceText),
      ...detectAriaLabelText(input.filePath, input.sourceText)
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

function detectStringAttribute(
  filePath: string,
  sourceText: string,
  config: AttributeRuleConfig
): Finding[] {
  return collectJsxAttributeStringValues(sourceText, [config.attributeName]).map((node, index) => ({
    id: `${filePath}:${config.ruleId}:${node.startLine}:${node.startColumn}:${index}`,
    ruleId: config.ruleId,
    severity: "high",
    category: "localization",
    message: `${config.messagePrefix}: "${node.value}"`,
    explanation: config.explanation,
    location: {
      filePath,
      startLine: node.startLine,
      startColumn: node.startColumn,
      endLine: node.endLine,
      endColumn: node.endColumn
    },
    fixable: true,
    suggestions: [{ message: config.suggestion }]
  }));
}

export function detectPlaceholderText(filePath: string, sourceText: string): Finding[] {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "placeholder",
    ruleId: "NHT1002",
    messagePrefix: "Hardcoded placeholder found",
    explanation: "User-facing placeholder text should be moved to localization files.",
    suggestion: "Extract this placeholder to a localization key."
  });
}

export function detectTitleAttributeText(filePath: string, sourceText: string): Finding[] {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "title",
    ruleId: "NHT1003",
    messagePrefix: "Hardcoded title attribute found",
    explanation: "User-facing title attributes should be moved to localization files.",
    suggestion: "Extract this title attribute to a localization key."
  });
}

export function detectAriaLabelText(filePath: string, sourceText: string): Finding[] {
  return detectStringAttribute(filePath, sourceText, {
    attributeName: "aria-label",
    ruleId: "NHT1004",
    messagePrefix: "Hardcoded aria-label found",
    explanation: "User-facing accessibility labels should be moved to localization files.",
    suggestion: "Extract this aria-label to a localization key."
  });
}
