import type { Finding, RuleMetadata } from "@nohardtext/domain";
import { detectAltAttributeText } from "./alt";
import { detectAriaLabelText } from "./aria-label";
import { detectJsxText } from "./jsx-text";
import { detectPlaceholderText } from "./placeholder";
import { detectTitleAttributeText } from "./title";
import { detectCustomComponentPropText } from "./custom-component-prop";

export type BuiltInRuleDetector = (
  filePath: string,
  sourceText: string
) => Finding[];

export interface BuiltInRuleDefinition {
  metadata: RuleMetadata;
  detect: BuiltInRuleDetector;
}

export const builtInRules: BuiltInRuleDefinition[] = [
  {
    metadata: {
      id: "NHT1001",
      name: "JSX Text",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded user-facing text inside JSX nodes.",
      fixable: true
    },
    detect: detectJsxText
  },
  {
    metadata: {
      id: "NHT1002",
      name: "Placeholder Attribute",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded placeholder attribute values.",
      fixable: true
    },
    detect: detectPlaceholderText
  },
  {
    metadata: {
      id: "NHT1003",
      name: "Title Attribute",
      category: "localization",
      severity: "high",
      description: "Detects hardcoded title attribute values.",
      fixable: true
    },
    detect: detectTitleAttributeText
  },
  {
    metadata: {
      id: "NHT1004",
      name: "ARIA Label",
      category: "accessibility",
      severity: "high",
      description: "Detects hardcoded aria-label attribute values.",
      fixable: true
    },
    detect: detectAriaLabelText
  },
  {
    metadata: {
      id: "NHT1005",
      name: "Alt Attribute",
      category: "accessibility",
      severity: "high",
      description: "Detects hardcoded image alt attribute values.",
      fixable: true
    },
    
    detect: detectAltAttributeText
  },
  {
  metadata: {
    id: "NHT1006",
    name: "Component Text Prop",
    category: "localization",
    severity: "high",
    description: "Detects hardcoded user-facing text passed through common component props.",
    fixable: true
  },
  detect: detectCustomComponentPropText
}
];

export const builtInRuleDetectors = builtInRules.map((rule) => rule.detect);

export function getBuiltInRuleMetadata(): RuleMetadata[] {
  return builtInRules.map((rule) => rule.metadata);
}
