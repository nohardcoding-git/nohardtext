import type { Finding } from "@nohardcoding/nohardtext-domain";
import { detectStringAttribute } from "./string-attribute";

const DEFAULT_COMPONENT_TEXT_PROPS = [
  "label",
  "description",
  "helperText",
  "emptyText",
  "confirmText",
  "cancelText",
  "submitText",
  "closeText",
  "primaryText",
  "secondaryText",
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
  "warningTitle"
];

export interface ComponentTextPropOptions {
  propNames?: string[];
}

function getComponentTextProps(options: ComponentTextPropOptions = {}): string[] {
  return [...new Set([...DEFAULT_COMPONENT_TEXT_PROPS, ...(options.propNames ?? [])])];
}

export function detectCustomComponentPropText(
  filePath: string,
  sourceText: string,
  options: ComponentTextPropOptions = {}
): Finding[] {
  return getComponentTextProps(options).flatMap((attributeName) =>
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