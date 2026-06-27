import { File } from '@babel/types';

interface JsxTextNode {
    text: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
interface JsxAttributeStringNode {
    name: string;
    value: string;
    elementName?: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
declare function parseSource(source: string): File;
declare function collectJsxTextNodes(source: string): JsxTextNode[];
declare function collectJsxAttributeStringValues(source: string, attributeNames: string[]): JsxAttributeStringNode[];
interface JsxExpressionStringNode {
    value: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
declare function collectJsxExpressionStringValues(source: string): JsxExpressionStringNode[];

export { type JsxAttributeStringNode, type JsxExpressionStringNode, type JsxTextNode, collectJsxAttributeStringValues, collectJsxExpressionStringValues, collectJsxTextNodes, parseSource };
