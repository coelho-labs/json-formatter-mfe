import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.tsx";

vi.mock("@/components/code-editor/CodeEditor.tsx", () => ({
  CodeEditor: ({ initialAriaLabel }: { initialAriaLabel?: string }) => (
    <textarea aria-label={initialAriaLabel} readOnly />
  ),
}));

const THEME_KEY = "coelho-theme";

function goTo(path: string): void {
  window.history.pushState({}, "", path);
}

function stubPrefersDark(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches })),
  });
}

describe("Given the dev shell opened at the module root", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    stubPrefersDark(false);
    goTo("/json-formatter/");
    render(<App />);
  });

  describe("when it renders", () => {
    it("then the shell header should be visible", () => {
      expect(screen.getByText(/json formatter · dev shell/i)).toBeVisible();
    });

    it("then the module home should be mounted in the outlet", () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /formatador e validador json/i,
        }),
      ).toBeInTheDocument();
    });

    it("then the production notice should be present", () => {
      expect(
        screen.getByText(/em produção este módulo é consumido/i),
      ).toBeInTheDocument();
    });
  });
});

describe("Given the dev shell opened at the index route", () => {
  beforeEach(() => {
    localStorage.clear();
    goTo("/");
    render(<App />);
  });

  describe("when the router resolves the redirect", () => {
    it("then the module should be opened under its own prefix", () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /formatador e validador json/i,
        }),
      ).toBeInTheDocument();
    });

    it("then the address bar should be rewritten to the module prefix", () => {
      expect(window.location.pathname).toBe("/json-formatter/");
    });
  });
});

describe("Given the dev shell with the dark theme stored", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(THEME_KEY, "dark");
    document.documentElement.classList.remove("dark");
    stubPrefersDark(false);
    goTo("/json-formatter/");
    render(<App />);
  });

  describe("when it renders", () => {
    it("then the document should carry the dark class", () => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("then the color scheme should follow the dark theme", () => {
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });
});

describe("Given the dev shell following the system theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    stubPrefersDark(true);
    goTo("/json-formatter/");
    render(<App />);
  });

  describe("when it renders", () => {
    it("then the dark theme should be applied", () => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("when the theme toggle is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /alternar tema/i }),
      );
    });

    it("then the dark class should be removed", () => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("then the chosen theme should be persisted as light", () => {
      expect(localStorage.getItem(THEME_KEY)).toBe("light");
    });
  });
});
