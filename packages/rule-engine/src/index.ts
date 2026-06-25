import type { Finding } from '@nohardtext/domain';

export interface RuleContext {
  filePath: string;
  sourceText: string;
}

export interface Rule {
  id: string;
  name: string;
  run(context: RuleContext): Finding[];
}

export function runRules(rules: Rule[], context: RuleContext): Finding[] {
  return rules.flatMap((rule) => rule.run(context));
}
