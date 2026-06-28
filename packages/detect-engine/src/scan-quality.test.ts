import { describe, expect, it } from "vitest";
import { detect } from "./index";

function scan(sourceText: string) {
  return detect({
    filePath: "src/App.tsx",
    sourceText,
  }).findings;
}

describe("@nohardtext/detect-engine scan quality", () => {
  it("does not flag common technical JSX attributes", () => {
    const findings = scan(`
      export default function App() {
        return (
          <main
            id="main-content"
            className="page-shell"
            data-testid="dashboard-page"
            role="main"
            aria-hidden="false"
          >
            <a href="/settings" target="_blank" rel="noreferrer" />
            <button type="button" className="btn-primary" />
            <input
              name="email"
              autoComplete="email"
              value="admin@example.com"
              inputMode="email"
            />
          </main>
        );
      }
    `);

    expect(findings).toEqual([]);
  });

  it("does not flag common localization patterns", () => {
    const findings = scan(`
      import { FormattedMessage } from "react-intl";

      export default function App({ intl }: { intl: any }) {
        return (
          <>
            <button>{t("actions.save")}</button>
            <button>{i18n.t("actions.cancel")}</button>
            <button>{intl.formatMessage({ id: "actions.delete" })}</button>
            <FormattedMessage id="actions.confirm" />
          </>
        );
      }
    `);

    expect(findings).toEqual([]);
  });

  it("detects high-confidence user-facing UI text", () => {
    const findings = scan(`
      export default function App() {
        return (
          <>
            <h1>Welcome back</h1>
            <button title="Create project" aria-label="Create project button">
              Create project
            </button>
            <input placeholder="Search projects..." />
            <img src="/logo.png" alt="Company logo" />
            <Button label="Save changes" />
            <EmptyState description="No projects yet" />
            <Modal confirmText="Delete project" cancelText="Cancel" />
          </>
        );
      }
    `);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1003",
      "NHT1004",
      "NHT1001",
      "NHT1002",
      "NHT1005",
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006",
    ]);

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Welcome back"',
      'Hardcoded title attribute found: "Create project"',
      'Hardcoded aria-label found: "Create project button"',
      'Hardcoded JSX text found: "Create project"',
      'Hardcoded placeholder found: "Search projects..."',
      'Hardcoded alt attribute found: "Company logo"',
      'Hardcoded component prop "label" found: "Save changes"',
      'Hardcoded component prop "description" found: "No projects yet"',
      'Hardcoded component prop "confirmText" found: "Delete project"',
      'Hardcoded component prop "cancelText" found: "Cancel"',
    ]);
  });

  it("detects conditional and logical expression UI strings", () => {
    const findings = scan(`
      export default function App({
        isSaving,
        hasError,
      }: {
        isSaving: boolean;
        hasError: boolean;
      }) {
        return (
          <>
            <button>{isSaving ? "Saving..." : "Save"}</button>
            <p>{hasError && "Something went wrong"}</p>
          </>
        );
      }
    `);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1001",
      "NHT1001",
    ]);

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Saving..."',
      'Hardcoded JSX text found: "Save"',
      'Hardcoded JSX text found: "Something went wrong"',
    ]);
  });
  it("does not flag code-like content in developer/documentation elements", () => {
    const findings = scan(`
      export default function App() {
        return (
          <article>
            <pre>npm install -D @nohardcoding/nohardtext</pre>
            <code>npx nohardtext scan src</code>
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
            <samp>Findings: 0</samp>
          </article>
        );
      }
    `);

    expect(findings).toEqual([]);
  });

  it("does not flag non-localizable symbol and numeric tokens", () => {
    const findings = scan(`
      export default function App() {
        return (
          <>
            <span>404</span>
            <span>500</span>
            <span>100%</span>
            <span>v1.2.3</span>
            <span>?</span>
            <span>�</span>
            <span>+</span>
            <span>-</span>
            <span>/</span>
            <span>...</span>
          </>
        );
      }
    `);

    expect(findings).toEqual([]);
  });

  it("still detects real user-facing text near ignored technical tokens", () => {
    const findings = scan(`
      export default function App() {
        return (
          <>
            <span>404</span>
            <h1>Page not found</h1>
            <code>npm install</code>
            <p>Try searching for another page</p>
          </>
        );
      }
    `);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1001",
      "NHT1001",
    ]);

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded JSX text found: "Page not found"',
      'Hardcoded JSX text found: "Try searching for another page"',
    ]);
  });

  it("detects common real-world custom component text props by default", () => {
    const findings = scan(`
      export default function App() {
        return (
          <>
            <Toast message="Saved successfully" />
            <Tooltip text="Copy link" />
            <HelpIcon tooltip="This field is required" />
            <Alert errorMessage="Something went wrong" />
            <Alert successMessage="Project created" />
            <Alert warningMessage="This action cannot be undone" />
            <Loader loadingText="Loading projects..." />
            <EmptyState emptyMessage="No projects found" />
          </>
        );
      }
    `);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006",
      "NHT1006",
    ]);

    expect(findings.map((finding) => finding.message)).toEqual([
      'Hardcoded component prop "message" found: "Saved successfully"',
      'Hardcoded component prop "text" found: "Copy link"',
      'Hardcoded component prop "tooltip" found: "This field is required"',
      'Hardcoded component prop "errorMessage" found: "Something went wrong"',
      'Hardcoded component prop "successMessage" found: "Project created"',
      'Hardcoded component prop "warningMessage" found: "This action cannot be undone"',
      'Hardcoded component prop "loadingText" found: "Loading projects..."',
      'Hardcoded component prop "emptyMessage" found: "No projects found"',
    ]);
  });

  it("does not flag real-world text-like props on native lowercase elements", () => {
    const findings = scan(`
      export default function App() {
        return (
          <>
            <div message="not-user-facing-native-prop" />
            <span text="not-user-facing-native-prop" />
            <input errorMessage="not-user-facing-native-prop" />
            <section loadingText="not-user-facing-native-prop" />
          </>
        );
      }
    `);

    expect(findings).toEqual([]);
  });

});
