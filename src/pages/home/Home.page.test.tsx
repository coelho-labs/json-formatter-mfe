import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "./Home.page.tsx";

function renderHomeAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Given the home page mounted at the module root", () => {
  beforeEach(() => {
    renderHomeAt("/json-formatter/");
  });

  describe("when it renders", () => {
    it("then the hero should present the tool name", () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /formatador e validador json/i,
        }),
      ).toBeInTheDocument();
    });

    it("then the call to action should open the tool relatively", () => {
      expect(
        screen.getByRole("link", { name: /abrir ferramenta/i }),
      ).toHaveAttribute("href", "/json-formatter/tool");
    });
  });
});

describe("Given the home page feature list", () => {
  beforeEach(() => {
    renderHomeAt("/");
  });

  describe("when it renders", () => {
    it("then the section should be labelled by its heading", () => {
      expect(
        screen.getByRole("region", { name: /o que a ferramenta faz/i }),
      ).toBeInTheDocument();
    });

    it("then every feature should be listed", () => {
      const list = screen.getByRole("list");

      expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    });

    it("then the formatting feature should be described", () => {
      expect(screen.getByText("Formatar")).toBeInTheDocument();
      expect(
        screen.getByText(/indentação de 2 ou 4 espaços/i),
      ).toBeInTheDocument();
    });

    it("then the minify feature should be described", () => {
      expect(screen.getByText("Minificar")).toBeInTheDocument();
    });

    it("then the validate feature should be described", () => {
      expect(screen.getByText("Validar")).toBeInTheDocument();
    });
  });
});

describe("Given the home page feature descriptions", () => {
  beforeEach(() => {
    renderHomeAt("/json-formatter/");
  });

  describe("when it renders", () => {
    it("then the minify feature should explain the compaction", () => {
      expect(
        screen.getByText(
          /compacte o json removendo espaços e quebras de linha/i,
        ),
      ).toBeInTheDocument();
    });

    it("then the validate feature should explain the diagnostics", () => {
      expect(
        screen.getByText(
          /detecte erros de sintaxe com mensagem e posição/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
