import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import type { NodePath, TraverseOptions } from "@babel/traverse";
import type { File, JSXAttribute, JSXText } from "@babel/types";
import type { JSXExpressionContainer } from "@babel/types";

type TraverseFn = (parent: File, opts: TraverseOptions) => void;

const traverse = ((traverseModule as unknown as { default?: TraverseFn })
  .default ?? traverseModule) as unknown as TraverseFn;

const IGNORED_JSX_TEXT_ELEMENTS = new Set([
  "pre",
  "code",
  "kbd",
  "samp"
]);

function getJsxElementName(nameNode: any): string | undefined {
  if (!nameNode || nameNode.type !== "JSXIdentifier") {
    return undefined;
  }

  return nameNode.name;
}

function isInsideIgnoredJsxTextElement(path: NodePath<JSXText>): boolean {
  const parentElementPath = path.findParent((parentPath) =>
    parentPath.isJSXElement()
  );

  const openingElement = (parentElementPath?.node as any)?.openingElement;
  const elementName = getJsxElementName(openingElement?.name);

  return elementName ? IGNORED_JSX_TEXT_ELEMENTS.has(elementName) : false;
}

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
  elementName?: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export function parseSource(source: string): File {
  return parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

function getAttributeElementName(
  path: NodePath<JSXAttribute>,
): string | undefined {
  const parent = path.parent as any;

  if (parent?.type !== "JSXOpeningElement") {
    return undefined;
  }

  return getJsxElementName(parent.name);
}

export function collectJsxTextNodes(source: string): JsxTextNode[] {
  const ast = parseSource(source);
  const results: JsxTextNode[] = [];

  traverse(ast, {
    JSXText(path: NodePath<JSXText>) {
      const text = path.node.value.trim();

      if (isInsideIgnoredJsxTextElement(path)) return;

      if (!text || !path.node.loc) return;

      results.push({
        text,
        startLine: path.node.loc.start.line,
        startColumn: path.node.loc.start.column + 1,
        endLine: path.node.loc.end.line,
        endColumn: path.node.loc.end.column + 1,
      });
    },
  });

  return results;
}

function getStaticStringFromAttributeValue(valueNode: JSXAttribute["value"]):
  | {
      value: string;
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    }
  | undefined {
  if (!valueNode) {
    return undefined;
  }

  if (valueNode.type === "StringLiteral") {
    const value = valueNode.value.trim();

    if (!value || !valueNode.loc) {
      return undefined;
    }

    return {
      value,
      startLine: valueNode.loc.start.line,
      startColumn: valueNode.loc.start.column + 1,
      endLine: valueNode.loc.end.line,
      endColumn: valueNode.loc.end.column + 1,
    };
  }

  if (valueNode.type !== "JSXExpressionContainer") {
    return undefined;
  }

  const expression = valueNode.expression;

  if (expression.type === "StringLiteral") {
    const value = expression.value.trim();

    if (!value || !expression.loc) {
      return undefined;
    }

    return {
      value,
      startLine: expression.loc.start.line,
      startColumn: expression.loc.start.column + 1,
      endLine: expression.loc.end.line,
      endColumn: expression.loc.end.column + 1,
    };
  }

  if (expression.type === "TemplateLiteral") {
    const quasis = expression.quasis ?? [];
    const expressions = expression.expressions ?? [];

    if (expressions.length > 0 || quasis.length !== 1) {
      return undefined;
    }

    const value = (
      quasis[0]?.value?.cooked ??
      quasis[0]?.value?.raw ??
      ""
    ).trim();

    if (!value || !expression.loc) {
      return undefined;
    }

    return {
      value,
      startLine: expression.loc.start.line,
      startColumn: expression.loc.start.column + 1,
      endLine: expression.loc.end.line,
      endColumn: expression.loc.end.column + 1,
    };
  }

  return undefined;
}

export function collectJsxAttributeStringValues(
  source: string,
  attributeNames: string[],
): JsxAttributeStringNode[] {
  const ast = parseSource(source);
  const results: JsxAttributeStringNode[] = [];

  traverse(ast, {
    JSXAttribute(path: NodePath<JSXAttribute>) {
      const nameNode = path.node.name;

      if (nameNode.type !== "JSXIdentifier") return;

      const name = nameNode.name;

      if (!attributeNames.includes(name)) return;

      const valueResult = getStaticStringFromAttributeValue(path.node.value);

      if (!valueResult) return;

      results.push({
        name,
        value: valueResult.value,
        elementName: getAttributeElementName(path),
        startLine: valueResult.startLine,
        startColumn: valueResult.startColumn,
        endLine: valueResult.endLine,
        endColumn: valueResult.endColumn,
      });
    },
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
  value: string,
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
    endColumn: expression.loc?.end.column ?? expression.loc?.start.column ?? 0,
  });
}

function collectExpressionStrings(
  expression: any,
  nodes: JsxExpressionStringNode[],
): void {
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

export function collectJsxExpressionStringValues(
  source: string,
): JsxExpressionStringNode[] {
  const ast = parseSource(source);
  const nodes: JsxExpressionStringNode[] = [];

  traverse(ast, {
    JSXExpressionContainer(path: any) {
      if (path.parent?.type === "JSXAttribute") {
        return;
      }

      collectExpressionStrings(path.node.expression, nodes);
    },
  });

  return nodes;
}
