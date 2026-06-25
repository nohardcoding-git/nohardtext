import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import type { NodePath, TraverseOptions } from "@babel/traverse";
import type { File, JSXAttribute, JSXText } from "@babel/types";

type TraverseFn = (parent: File, opts: TraverseOptions) => void;

const traverse = (
  (traverseModule as unknown as { default?: TraverseFn }).default ??
  traverseModule
) as unknown as TraverseFn;

export interface JsxTextNode {
  text: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface JsxAttributeStringNode {
  name: string;
  value: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export function parseSource(source: string): File {
  return parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  });
}

export function collectJsxTextNodes(source: string): JsxTextNode[] {
  const ast = parseSource(source);
  const results: JsxTextNode[] = [];

  traverse(ast, {
    JSXText(path: NodePath<JSXText>) {
      const text = path.node.value.trim();

      if (!text || !path.node.loc) return;

      results.push({
        text,
        startLine: path.node.loc.start.line,
        startColumn: path.node.loc.start.column + 1,
        endLine: path.node.loc.end.line,
        endColumn: path.node.loc.end.column + 1
      });
    }
  });

  return results;
}

export function collectJsxAttributeStringValues(
  source: string,
  attributeNames: string[]
): JsxAttributeStringNode[] {
  const ast = parseSource(source);
  const results: JsxAttributeStringNode[] = [];

  traverse(ast, {
    JSXAttribute(path: NodePath<JSXAttribute>) {
      const nameNode = path.node.name;

      if (nameNode.type !== "JSXIdentifier") return;

      const name = nameNode.name;

      if (!attributeNames.includes(name)) return;

      const valueNode = path.node.value;

      if (!valueNode || valueNode.type !== "StringLiteral" || !valueNode.loc) return;

      const value = valueNode.value.trim();

      if (!value) return;

      results.push({
        name,
        value,
        startLine: valueNode.loc.start.line,
        startColumn: valueNode.loc.start.column + 1,
        endLine: valueNode.loc.end.line,
        endColumn: valueNode.loc.end.column + 1
      });
    }
  });

  return results;
}
