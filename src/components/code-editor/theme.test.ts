import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import themeSource from "./theme.ts?raw";
import { codeEditorTheme } from "./theme.ts";

// `?raw` sobre .css é neutralizado pelo Vitest (CSS vira módulo vazio), então a
// fonte canônica de tokens é lida direto do disco (cwd = raiz do repo).
const themeCss = readFileSync(join(process.cwd(), "src/index.css"), "utf8");

const COLOR_PROPERTY =
  /(?:color|backgroundColor|caretColor|borderLeftColor|borderRightColor)\s*:\s*([^,;}\n]+)/g;

function extractColorValues(source: string): string[] {
  return [...source.matchAll(COLOR_PROPERTY)].map((match) =>
    match[1].trim().replaceAll(/^["']|["']$/g, ""),
  );
}

function extractTokenReferences(source: string): string[] {
  return [...source.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(
    (match) => match[1],
  );
}

function extractDeclaredTokens(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1]),
  );
}

describe("Given the CodeMirror theme source", () => {
  describe("when its color declarations are inspected", () => {
    let colorValues: string[];

    beforeEach(() => {
      colorValues = extractColorValues(themeSource);
    });

    it("then every color should come from a design token", () => {
      const hardcoded = colorValues.filter(
        (value) => !value.startsWith("var(--"),
      );

      expect(hardcoded).toEqual([]);
    });

    it("then it should declare at least one color", () => {
      expect(colorValues.length).toBeGreaterThan(0);
    });

    it("then it should not contain hexadecimal colors", () => {
      expect(themeSource).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    });

    it("then it should not contain rgb or hsl literals", () => {
      expect(themeSource).not.toMatch(/\b(?:rgba?|hsla?)\(/i);
    });
  });

  describe("when the referenced tokens are compared with index.css", () => {
    let missingTokens: string[];

    beforeEach(() => {
      const declared = extractDeclaredTokens(themeCss);
      missingTokens = extractTokenReferences(themeSource).filter(
        (token) => !declared.has(token),
      );
    });

    it("then every referenced token should be declared in index.css", () => {
      expect(missingTokens).toEqual([]);
    });
  });

  describe("when the theme extension is imported", () => {
    it("then it should expose the editor theme paired with syntax highlighting", () => {
      expect(codeEditorTheme).toHaveLength(2);
    });
  });
});
