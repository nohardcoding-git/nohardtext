import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import type { NodePath, TraverseOptions } from "@babel/traverse";
import type { File, JSXText } from "@babel/types";

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

      if (!text) {
        return;
      }

      const loc = path.node.loc;

      if (!loc) {
        return;
      }

      results.push({
        text,
        startLine: loc.start.line,
        startColumn: loc.start.column + 1,
        endLine: loc.end.line,
        endColumn: loc.end.column + 1
      });
    }
  });

  return results;
}
