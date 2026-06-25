// src/index.ts
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
var traverse = traverseModule.default ?? traverseModule;
function parseSource(source) {
  return parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  });
}
function collectJsxTextNodes(source) {
  const ast = parseSource(source);
  const results = [];
  traverse(ast, {
    JSXText(path) {
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
export {
  collectJsxTextNodes,
  parseSource
};
