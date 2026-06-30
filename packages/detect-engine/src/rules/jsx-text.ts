import type { Finding } from "@nohardcoding/nohardtext-domain";
import {
  collectJsxExpressionStringValues,
  collectJsxTextNodes
} from "@nohardcoding/nohardtext-parser";
import { isProbablyLocalizableText } from "./text-utils";

interface LocalizableTextNode {
  text: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

function createJsxTextFinding(filePath: string, node: LocalizableTextNode, index: number): Finding {
  return {
    id: `${filePath}:NHT1001:${node.startLine}:${node.startColumn}:${index}`,
    ruleId: "NHT1001",
    severity: "high",
    category: "localization",
    message: `Hardcoded JSX text found: "${node.text}"`,
    explanation: "User-facing JSX text should be moved to localization files.",
    value: node.text,
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
        message: "Replace the text with a localized translation key."
      }
    ]
  };
}

export function detectJsxText(filePath: string, sourceText: string): Finding[] {
  const textNodes: LocalizableTextNode[] = collectJsxTextNodes(sourceText).map((node) => ({
    text: node.text,
    startLine: node.startLine,
    startColumn: node.startColumn,
    endLine: node.endLine,
    endColumn: node.endColumn
  }));

  const expressionStringNodes: LocalizableTextNode[] = collectJsxExpressionStringValues(sourceText).map((node) => ({
    text: node.value,
    startLine: node.startLine,
    startColumn: node.startColumn,
    endLine: node.endLine,
    endColumn: node.endColumn
  }));

  return [...textNodes, ...expressionStringNodes]
    .filter((node) => isProbablyLocalizableText(node.text))
    .map((node, index) => createJsxTextFinding(filePath, node, index));
}
