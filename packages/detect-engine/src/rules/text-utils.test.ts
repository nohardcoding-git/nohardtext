import { describe, expect, it } from "vitest";
import { isProbablyLocalizableText, normalizeUserFacingText } from "./text-utils";

describe("text utils", () => {
  it("normalizes whitespace", () => {
    expect(normalizeUserFacingText("  Start    Game  ")).toBe("Start Game");
  });

  it("detects localizable text", () => {
    expect(isProbablyLocalizableText("Welcome")).toBe(true);
    expect(isProbablyLocalizableText("Start Game")).toBe(true);
    expect(isProbablyLocalizableText("Search...")).toBe(true);
    expect(isProbablyLocalizableText("ابدأ اللعبة")).toBe(true);
  });

  it("ignores non-localizable symbols and numbers", () => {
    expect(isProbablyLocalizableText("")).toBe(false);
    expect(isProbablyLocalizableText("   ")).toBe(false);
    expect(isProbablyLocalizableText("|")).toBe(false);
    expect(isProbablyLocalizableText("→")).toBe(false);
    expect(isProbablyLocalizableText("×")).toBe(false);
    expect(isProbablyLocalizableText("2026")).toBe(false);
  });

  it("ignores urls, emails, and technical version tokens", () => {
    expect(isProbablyLocalizableText("https://example.com")).toBe(false);
    expect(isProbablyLocalizableText("support@example.com")).toBe(false);
    expect(isProbablyLocalizableText("v2.0")).toBe(false);
    expect(isProbablyLocalizableText("i18n")).toBe(false);
  });
});
