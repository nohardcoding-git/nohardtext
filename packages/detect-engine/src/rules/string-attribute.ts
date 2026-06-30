import type { Category, Finding, Severity } from "@nohardcoding/nohardtext-domain";
import { collectJsxAttributeStringValues } from "@nohardcoding/nohardtext-parser";
import { isProbablyLocalizableText } from "./text-utils";

export interface AttributeRuleConfig {
  attributeName: string;
  ruleId: string;
  messagePrefix: string;
  explanation: string;
  suggestion: string;
  category?: Category;
  severity?: Severity;
  customComponentsOnly?: boolean;
}

function isCustomComponentElement(elementName: string | undefined): boolean {
  if (!elementName) {
    return false;
  }

  return /^[A-Z]/.test(elementName);
}

export function detectStringAttribute(
  filePath: string,
  sourceText: string,
  config: AttributeRuleConfig
): Finding[] {
    return collectJsxAttributeStringValues(sourceText, [config.attributeName])
      .filter((node) => isProbablyLocalizableText(node.value))
      .filter((node) =>
        config.customComponentsOnly ? isCustomComponentElement(node.elementName) : true
      )
    .map((node, index) => ({
      id: `${filePath}:${config.ruleId}:${node.startLine}:${node.startColumn}:${index}`,
      ruleId: config.ruleId,
      severity: config.severity ?? "high",
      category: config.category ?? "localization",
      message: `${config.messagePrefix}: "${node.value}"`,
      explanation: config.explanation,
      value: node.value,
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
