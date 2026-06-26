import { Finding } from '@nohardtext/domain';
import { Rule } from '@nohardtext/rule-engine';

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
declare function detectJsxText(filePath: string, sourceText: string): Finding[];
declare function detectPlaceholderText(filePath: string, sourceText: string): Finding[];
declare function detectTitleAttributeText(filePath: string, sourceText: string): Finding[];
declare function detectAriaLabelText(filePath: string, sourceText: string): Finding[];

export { type DetectInput, type DetectResult, detect, detectAriaLabelText, detectJsxText, detectPlaceholderText, detectTitleAttributeText };
