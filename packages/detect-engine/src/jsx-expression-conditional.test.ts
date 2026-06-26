import { describe, expect, it } from "vitest";
import { detect } from "./index";

describe("detect-engine JSX expression conditional strings", () => {
  it("detects user-facing strings from nested JSX expressions", () => {
    const sourceText = [
      "export function Example({ isSaving, isReady }: { isSaving: boolean; isReady: boolean }) {",
      "  return (",
      "    <>",
      "      <button>{isSaving ? \"Saving...\" : \"Save\"}</button>",
      "      <p>{isReady && \"Ready\"}</p>",
      "      <span>{`Done`}</span>",
      "      <div className={isSaving ? \"active\" : \"inactive\"} />",
      "    </>",
      "  );",
      "}"
    ].join("\n");

    const result = detect({
      filePath: "src/App.tsx",
      sourceText
    });

    expect(result.findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Saving..."',
      'Hardcoded JSX text found: "Save"',
      'Hardcoded JSX text found: "Ready"',
      'Hardcoded JSX text found: "Done"'
    ]);
  });
});
