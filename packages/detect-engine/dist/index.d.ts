import * as _nohardcoding_nohardtext_domain from '@nohardcoding/nohardtext-domain';
import { RuleMetadata, Finding } from '@nohardcoding/nohardtext-domain';
import { Rule } from '@nohardcoding/nohardtext-rule-engine';

interface BuiltInRuleOptions {
    componentTextProps?: string[];
}
declare function getBuiltInRuleMetadata(): RuleMetadata[];

declare function detectAltAttributeText(filePath: string, sourceText: string): _nohardcoding_nohardtext_domain.Finding[];

declare function detectAriaLabelText(filePath: string, sourceText: string): _nohardcoding_nohardtext_domain.Finding[];

declare function detectJsxText(filePath: string, sourceText: string): Finding[];

declare function detectPlaceholderText(filePath: string, sourceText: string): _nohardcoding_nohardtext_domain.Finding[];

declare function detectTitleAttributeText(filePath: string, sourceText: string): _nohardcoding_nohardtext_domain.Finding[];

interface ComponentTextPropOptions {
    propNames?: string[];
}
declare function detectCustomComponentPropText(filePath: string, sourceText: string, options?: ComponentTextPropOptions): Finding[];

declare function sortFindingsByLocation(findings: Finding[]): Finding[];
interface DetectInput {
    filePath: string;
    sourceText: string;
    rules?: Rule[];
    options?: BuiltInRuleOptions;
}
interface DetectResult {
    filePath: string;
    findings: Finding[];
}
declare function detect(input: DetectInput): DetectResult;

export { type DetectInput, type DetectResult, detect, detectAltAttributeText, detectAriaLabelText, detectCustomComponentPropText, detectJsxText, detectPlaceholderText, detectTitleAttributeText, getBuiltInRuleMetadata, sortFindingsByLocation };
