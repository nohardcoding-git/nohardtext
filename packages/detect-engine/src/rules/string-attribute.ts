import type { Finding } from "@nohardtext/domain";
import { collectJsxAttributeStringValues } from "@nohardtext/parser";
import { isProbablyLocalizableText } from "./text-utils";

export interface AttributeRuleConfig {
  attributeName: string;
  ruleId: string;
  messagePrefix: string;
  explanation: string;
  suggestion: string;
}

export function detectStringAttribute(
  filePath: string,
  sourceText: string,
  config: AttributeRuleConfig
): Finding[] {
  return collectJsxAttributeStringValues(sourceText, [config.attributeName])
    .filter((node) => isProbablyLocalizableText(node.value))
    .map((node, index) => ({
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
      suggestions: [
        {
          message: config.suggestion
        }
      ]
    }));
}
