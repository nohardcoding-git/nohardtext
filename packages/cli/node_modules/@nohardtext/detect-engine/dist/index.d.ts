import * as _nohardtext_domain from '@nohardtext/domain';
import { Finding, RuleMetadata } from '@nohardtext/domain';
import { Rule } from '@nohardtext/rule-engine';

declare function detectAltAttributeText(filePath: string, sourceText: string): _nohardtext_domain.Finding[];

declare function detectAriaLabelText(filePath: string, sourceText: string): _nohardtext_domain.Finding[];

declare function detectJsxText(filePath: string, sourceText: string): Finding[];

declare function detectPlaceholderText(filePath: string, sourceText: string): _nohardtext_domain.Finding[];

declare function detectTitleAttributeText(filePath: string, sourceText: string): _nohardtext_domain.Finding[];

declare function getBuiltInRuleMetadata(): RuleMetadata[];

declare function detectCustomComponentPropText(filePath: string, sourceText: string): Finding[];

interface DetectInput {
    filePath: string;
    sourceText: string;
    rules?: Rule[];
}
interface DetectResult {
    filePath: string;
    findings: Finding[];
}
declare function detect(input: DetectInput): DetectResult;

export { type DetectInput, type DetectResult, detect, detectAltAttributeText, detectAriaLabelText, detectCustomComponentPropText, detectJsxText, detectPlaceholderText, detectTitleAttributeText, getBuiltInRuleMetadata };
