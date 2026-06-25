import { describe, expect, it } from "vitest";
import {
  collectJsxAttributeStringValues,
  collectJsxTextNodes,
  parseSource
} from "./index";

describe("@nohardtext/parser", () => {
  it("parses TSX source", () => {
    const ast = parseSource("export default function App() { return <h1>Welcome</h1>; }");

    expect(ast.program.body.length).toBeGreaterThan(0);
  });

  it("collects JSX text nodes", () => {
    const nodes = collectJsxTextNodes(`
      export default function App() {
        return (
          <>
            <h1>Welcome</h1>
            <button>Start Game</button>
            <div className="hero" />
          </>
        );
      }
    `);

    expect(nodes).toHaveLength(2);
    expect(nodes.map((node) => node.text)).toEqual(["Welcome", "Start Game"]);
  });

  it("collects selected JSX string attributes", () => {
    const nodes = collectJsxAttributeStringValues(
      `
        export default function App() {
          return (
            <>
              <input placeholder="Search..." />
              <div className="hero" />
            </>
          );
        }
      `,
      ["placeholder"]
    );

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.name).toBe("placeholder");
    expect(nodes[0]?.value).toBe("Search...");
  });
});
