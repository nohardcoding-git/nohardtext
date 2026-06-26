import { describe, expect, it } from "vitest";
import { collectJsxExpressionStringValues } from "./index";

describe("JSX expression conditional strings", () => {
  it("collects user-facing strings from nested JSX expressions", () => {
    const source = [
      "export function Example({ isSaving, isReady }: { isSaving: boolean; isReady: boolean }) {",
      "  return (",
      "    <>",
      "      <button>{isSaving ? \"Saving...\" : \"Save\"}</button>",
      "      <p>{isReady && \"Ready\"}</p>",
      "      <span>{`Done`}</span>",
      "    </>",
      "  );",
      "}"
    ].join("\n");

    const nodes = collectJsxExpressionStringValues(source);

    expect(nodes.map((node) => node.value)).toEqual([
      "Saving...",
      "Save",
      "Ready",
      "Done"
    ]);
  });

  it("does not collect strings from JSX attributes", () => {
    const source = [
      "export function Example({ isActive }: { isActive: boolean }) {",
      "  return <div className={isActive ? \"active\" : \"inactive\"} />;",
      "}"
    ].join("\n");

    const nodes = collectJsxExpressionStringValues(source);

    expect(nodes).toEqual([]);
  });
});
