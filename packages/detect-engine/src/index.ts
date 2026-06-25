import type { Finding } from '@nohardtext/domain';
import { runRules, type Rule } from '@nohardtext/rule-engine';

export interface DetectInput {
  filePath: string;
  sourceText: string;
  rules: Rule[];
}

export interface DetectResult {
  filePath: string;
  findings: Finding[];
}

export function detect(input: DetectInput): DetectResult {
  return {
    filePath: input.filePath,
    findings: runRules(input.rules, {
      filePath: input.filePath,
      sourceText: input.sourceText
    })
  };
}
