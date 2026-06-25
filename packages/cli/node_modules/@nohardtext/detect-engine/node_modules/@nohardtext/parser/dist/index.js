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
function collectJsxAttributeStringValues(source, attributeNames) {
  const ast = parseSource(source);
  const results = [];
  traverse(ast, {
    JSXAttribute(path) {
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
export {
  collectJsxAttributeStringValues,
  collectJsxTextNodes,
  parseSource
};
