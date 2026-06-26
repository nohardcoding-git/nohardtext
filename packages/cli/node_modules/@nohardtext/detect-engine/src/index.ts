import type { Finding } from "@nohardtext/domain";
import { runRules, type Rule } from "@nohardtext/rule-engine";
import { builtInRules, getBuiltInRuleMetadata } from "./rules/registry";

export { detectAltAttributeText } from "./rules/alt";
export { detectAriaLabelText } from "./rules/aria-label";
export { detectJsxText } from "./rules/jsx-text";
export { detectPlaceholderText } from "./rules/placeholder";
export { detectTitleAttributeText } from "./rules/title";
export { getBuiltInRuleMetadata } from "./rules/registry";
export { detectCustomComponentPropText } from "./rules/custom-component-prop";
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

  const builtInFindings = builtInRules.flatMap((rule) =>
    rule.detect(input.filePath, input.sourceText)
  );

  return {
    filePath: input.filePath,
    findings: [...ruleFindings, ...builtInFindings]
  };
}
