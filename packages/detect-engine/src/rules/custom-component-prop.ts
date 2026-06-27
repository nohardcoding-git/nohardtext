import type { Finding } from "@nohardtext/domain";
import { detectStringAttribute } from "./string-attribute";

const COMPONENT_TEXT_PROPS = [
  "label",
  "description",
  "helperText",
  "emptyText",
  "confirmText",
  "cancelText",
  "submitText",
  "closeText",
  "primaryText",
  "secondaryText"
];

export function detectCustomComponentPropText(
  filePath: string,
  sourceText: string
): Finding[] {
  return COMPONENT_TEXT_PROPS.flatMap((attributeName) =>
    detectStringAttribute(filePath, sourceText, {
      attributeName,
      ruleId: "NHT1006",
      messagePrefix: `Hardcoded component prop "${attributeName}" found`,
      explanation: "User-facing component prop text should be moved to localization files.",
      suggestion: "Move this component prop text to a localization key.",
      category: "localization",
      severity: "high",
      customComponentsOnly: true
    })
  );
}