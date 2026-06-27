import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("@nohardcoding/nohardtext package metadata", () => {
  it("exposes the nohardtext binary", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.bin).toEqual({
      nohardtext: "dist/index.js",
    });
  });

  it("publishes only the built dist folder", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.files).toContain("dist");
  });
});
