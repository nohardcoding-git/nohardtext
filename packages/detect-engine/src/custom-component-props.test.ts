import { describe, expect, it } from "vitest";
import { detectCustomComponentPropText } from "./index";

describe("custom component prop detection", () => {
  it("reports text props on custom components only", () => {
    const findings = detectCustomComponentPropText(
      "src/App.tsx",
      `
        export default function App() {
          return (
            <>
              <Button label="Save" />
              <EmptyState description="No results" />
              <div label="Technical label" />
              <input placeholder="Search..." label="Input label" />
            </>
          );
        }
      `
    );

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded component prop "label" found: "Save"',
      'Hardcoded component prop "description" found: "No results"'
    ]);
  });
});