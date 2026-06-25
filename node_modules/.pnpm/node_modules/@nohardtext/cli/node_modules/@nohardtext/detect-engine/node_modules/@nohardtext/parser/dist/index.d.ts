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
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
declare function parseSource(source: string): File;
declare function collectJsxTextNodes(source: string): JsxTextNode[];
declare function collectJsxAttributeStringValues(source: string, attributeNames: string[]): JsxAttributeStringNode[];

export { type JsxAttributeStringNode, type JsxTextNode, collectJsxAttributeStringValues, collectJsxTextNodes, parseSource };
