import { describe, expect, it } from "vitest";
import { detect } from "./index";

describe("real-world React component detection", () => {
  it("reports user-facing strings and ignores technical strings", () => {
    const result = detect({
      filePath: "src/Dashboard.tsx",
      sourceText: `
        export function Dashboard({ isLoading, hasResults }: { isLoading: boolean; hasResults: boolean }) {
          return (
            <section className="dashboard" data-testid="dashboard-root">
              <Header title={t("dashboard.title")} />

              <Button label="Create Project" />
              <EmptyState
                title="No projects yet"
                description="Create your first project to get started"
              />

              <button className={isLoading ? "loading" : "ready"}>
                {isLoading ? "Loading..." : "Refresh"}
              </button>

              <span>{hasResults && "Results ready"}</span>
              <span>v2.0</span>
              <span>|</span>
            </section>
          );
        }
      `
    });

    expect(result.findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Loading..."',
      'Hardcoded JSX text found: "Refresh"',
      'Hardcoded JSX text found: "Results ready"',
      'Hardcoded title attribute found: "No projects yet"',
      'Hardcoded component prop "label" found: "Create Project"',
      'Hardcoded component prop "description" found: "Create your first project to get started"'
    ]);
  });
});