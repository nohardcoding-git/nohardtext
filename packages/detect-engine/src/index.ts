import type { Finding } from "@nohardcoding/nohardtext-domain";
import { runRules, type Rule } from "@nohardcoding/nohardtext-rule-engine";

import {
  builtInRules,
  getBuiltInRuleMetadata,
  type BuiltInRuleOptions
} from "./rules/registry";

export { detectAltAttributeText } from "./rules/alt";
export { detectAriaLabelText } from "./rules/aria-label";
export { detectJsxText } from "./rules/jsx-text";
export { detectPlaceholderText } from "./rules/placeholder";
export { detectTitleAttributeText } from "./rules/title";
export { detectCustomComponentPropText } from "./rules/custom-component-prop";
export { detectCrossFileDuplicates, crossFileDuplicateRuleMetadata } from "./rules/cross-file-duplicate";
export { getBuiltInRuleMetadata } from "./rules/registry";

export function sortFindingsByLocation(findings: Finding[]): Finding[] {
  return [...findings].sort((left, right) => {
    const filePathOrder = left.location.filePath.localeCompare(
      right.location.filePath,
    );

    if (filePathOrder !== 0) {
      return filePathOrder;
    }

    if (left.location.startLine !== right.location.startLine) {
      return left.location.startLine - right.location.startLine;
    }

    if (left.location.startColumn !== right.location.startColumn) {
      return left.location.startColumn - right.location.startColumn;
    }

    return left.ruleId.localeCompare(right.ruleId);
  });
}

export interface DetectInput {
  filePath: string;
  sourceText: string;
  rules?: Rule[];
  options?: BuiltInRuleOptions;
}

export interface DetectResult {
  filePath: string;
  findings: Finding[];
}

export function detect(input: DetectInput): DetectResult {
  const ruleFindings = input.rules
    ? runRules(input.rules, {
        filePath: input.filePath,
        sourceText: input.sourceText,
      })
    : [];

const builtInFindings = builtInRules.flatMap((rule) =>
  rule.detect(input.filePath, input.sourceText, input.options)
);

  return {
    filePath: input.filePath,
    findings: sortFindingsByLocation([...ruleFindings, ...builtInFindings]),
  };
}
