import { Finding } from '@nohardcoding/nohardtext-domain';

interface RuleContext {
    filePath: string;
    sourceText: string;
}
interface Rule {
    id: string;
    name: string;
    run(context: RuleContext): Finding[];
}
declare function runRules(rules: Rule[], context: RuleContext): Finding[];

export { type Rule, type RuleContext, runRules };
