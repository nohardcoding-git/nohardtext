import type { Finding } from "@nohardtext/domain";
import { collectJsxTextNodes } from "@nohardtext/parser";
import { isProbablyLocalizableText } from "./text-utils";

export function detectJsxText(filePath: string, sourceText: string): Finding[] {
  return collectJsxTextNodes(sourceText)
    .filter((node) => isProbablyLocalizableText(node.text))
    .map((node, index) => ({
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
      suggestions: [
        {
          message: "Replace the text with a localized translation key."
        }
      ]
    }));
}
