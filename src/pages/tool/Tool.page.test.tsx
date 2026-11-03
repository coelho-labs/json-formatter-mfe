import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Tool from "./Tool.page.tsx";

vi.mock("@/components/code-editor/CodeEditor.tsx", () => ({
  CodeEditor: ({
    value,
    onChange,
    initialAriaLabel,
    readOnly,
  }: {
    value: string;
    onChange?: (value: string) => void;
    initialAriaLabel?: string;
    readOnly?: boolean;
  }) => (
    <textarea
      aria-label={initialAriaLabel}
      readOnly={readOnly}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

const VALID_INPUT = '{"b":1,"a":2}';

function renderTool(): void {
  render(
    <MemoryRouter initialEntries={["/json-formatter/tool"]}>
      <Routes>
        <Route path="/json-formatter/tool" element={<Tool />} />
      </Routes>
    </MemoryRouter>,
  );
}

function input(): HTMLElement {
  return screen.getByLabelText(/editor json de entrada/i);
}

function output(): HTMLElement {
  return screen.getByLabelText(/saída json formatada/i);
}

function typeInput(value: string): void {
  fireEvent.change(input(), { target: { value } });
}

describe("Given the tool page mounted with an empty formatter", () => {
  beforeEach(() => {
    renderTool();
  });

  describe("when it renders", () => {
    it("then the page should be titled", () => {
      expect(
        screen.getByRole("heading", { level: 1, name: /ferramenta json/i }),
      ).toBeInTheDocument();
    });

    it("then the format action should be disabled", () => {
      expect(screen.getByRole("button", { name: /formatar/i })).toBeDisabled();
    });

    it("then the output should invite the user to run an action", () => {
      expect(
        screen.getByText(/o resultado aparecerá aqui/i),
      ).toBeInTheDocument();
    });

    it("then the back link should point to the parent route", () => {
      expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute(
        "href",
        "/json-formatter",
      );
    });

    it("then the tree section should not be rendered", () => {
      expect(
        screen.queryByRole("heading", { name: /árvore \(leitura\)/i }),
      ).toBeNull();
    });
  });
});

describe("Given the tool page with valid JSON typed", () => {
  beforeEach(() => {
    renderTool();
    typeInput(VALID_INPUT);
  });

  describe("when the format action is triggered", () => {
    beforeEach(async () => {
      await userEvent.click(screen.getByRole("button", { name: /formatar/i }));
    });

    it("then the output should be formatted with two spaces", () => {
      expect(output()).toHaveValue('{\n  "b": 1,\n  "a": 2\n}');
    });

    it("then the output placeholder should be removed", () => {
      expect(screen.queryByText(/o resultado aparecerá aqui/i)).toBeNull();
    });
  });

  describe("when the validate action is triggered on invalid JSON", () => {
    beforeEach(async () => {
      typeInput('{"a":1,}');
      await userEvent.click(screen.getByRole("button", { name: /validar/i }));
    });

    it("then an invalid badge should be announced", () => {
      expect(screen.getByText(/^inválido — /i)).toBeInTheDocument();
    });

    it("then the parse error should be described", () => {
      expect(
        screen.getByText(/esperado nome de propriedade/i),
      ).toBeInTheDocument();
    });
  });
});

describe("Given the tool page with a formatted result", () => {
  beforeEach(async () => {
    renderTool();
    typeInput(VALID_INPUT);
    await userEvent.click(screen.getByRole("button", { name: /formatar/i }));
  });

  describe("when the output is copied", () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      writeText = vi.fn(() => Promise.resolve());
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });
      await userEvent.click(screen.getByRole("button", { name: /copiar/i }));
    });

    it("then the formatted output should reach the clipboard", () => {
      expect(writeText).toHaveBeenCalledWith('{\n  "b": 1,\n  "a": 2\n}');
    });

    it("then the copy feedback should be announced", () => {
      expect(
        screen.getByText(/copiado para a área de transferência/i),
      ).toBeInTheDocument();
    });
  });

  describe("when the tree mode is requested", () => {
    beforeEach(async () => {
      await userEvent.click(screen.getByRole("button", { name: /modo/i }));
    });

    it("then the tree section should replace the text output", () => {
      expect(
        screen.getByRole("heading", { name: /árvore \(leitura\)/i }),
      ).toBeInTheDocument();
    });

    it("then the tree should expose its root toggle", () => {
      expect(
        screen.getByRole("button", { name: /recolher raiz/i }),
      ).toBeInTheDocument();
    });
  });

  describe("when the formatter is cleared", () => {
    beforeEach(async () => {
      await userEvent.click(screen.getByRole("button", { name: /limpar/i }));
    });

    it("then the editor should be emptied", () => {
      expect(input()).toHaveValue("");
    });

    it("then the output placeholder should return", () => {
      expect(
        screen.getByText(/o resultado aparecerá aqui/i),
      ).toBeInTheDocument();
    });
  });
});
