import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import type { NodePath, TraverseOptions } from "@babel/traverse";
import type { File, JSXAttribute, JSXText } from "@babel/types";
import type { JSXExpressionContainer } from "@babel/types";

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

export interface JsxExpressionStringNode {
  value: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

function pushJsxExpressionString(
  nodes: JsxExpressionStringNode[],
  expression: any,
  value: string
): void {
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  nodes.push({
    value: trimmed,
    startLine: expression.loc?.start.line ?? 1,
    startColumn: expression.loc?.start.column ?? 0,
    endLine: expression.loc?.end.line ?? expression.loc?.start.line ?? 1,
    endColumn: expression.loc?.end.column ?? expression.loc?.start.column ?? 0
  });
}

function collectExpressionStrings(expression: any, nodes: JsxExpressionStringNode[]): void {
  if (!expression) {
    return;
  }

  if (expression.type === "StringLiteral") {
    pushJsxExpressionString(nodes, expression, expression.value);
    return;
  }

  if (expression.type === "TemplateLiteral") {
    const quasis = expression.quasis ?? [];
    const expressions = expression.expressions ?? [];

    if (expressions.length === 0 && quasis.length === 1) {
      const value = quasis[0]?.value?.cooked ?? quasis[0]?.value?.raw;

      if (typeof value === "string") {
        pushJsxExpressionString(nodes, expression, value);
      }
    }

    return;
  }

  if (expression.type === "ConditionalExpression") {
    collectExpressionStrings(expression.consequent, nodes);
    collectExpressionStrings(expression.alternate, nodes);
    return;
  }

  if (expression.type === "LogicalExpression") {
    collectExpressionStrings(expression.left, nodes);
    collectExpressionStrings(expression.right, nodes);
    return;
  }

  if (
    expression.type === "ParenthesizedExpression" ||
    expression.type === "TSAsExpression" ||
    expression.type === "TSTypeAssertion" ||
    expression.type === "TypeCastExpression"
  ) {
    collectExpressionStrings(expression.expression, nodes);
  }
}

export function collectJsxExpressionStringValues(source: string): JsxExpressionStringNode[] {
  const ast = parseSource(source);
  const nodes: JsxExpressionStringNode[] = [];

  traverse(ast, {
    JSXExpressionContainer(path: any) {
      if (path.parent?.type === "JSXAttribute") {
        return;
      }

      collectExpressionStrings(path.node.expression, nodes);
    }
  });

  return nodes;
}
