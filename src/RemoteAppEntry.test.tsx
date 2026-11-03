import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RemoteAppEntry from "./RemoteAppEntry.tsx";

vi.mock("@/components/code-editor/CodeEditor.tsx", () => ({
  CodeEditor: ({ initialAriaLabel }: { initialAriaLabel?: string }) => (
    <textarea aria-label={initialAriaLabel} readOnly />
  ),
}));

function renderEntry(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <RemoteAppEntry />
    </MemoryRouter>,
  );
}

describe("Given the remote entry mounted by the host router", () => {
  describe("when the host route is the module root", () => {
    beforeEach(() => {
      renderEntry("/");
    });

    it("then the home page should be rendered", () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /formatador e validador json/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("when the host route is the tool path", () => {
    beforeEach(() => {
      renderEntry("/tool");
    });

    it("then the tool page should be rendered", () => {
      expect(
        screen.getByRole("heading", { level: 1, name: /ferramenta json/i }),
      ).toBeInTheDocument();
    });
  });

  describe("when the host route is not owned by the module", () => {
    beforeEach(() => {
      renderEntry("/desconhecido");
    });

    it("then no module page should be rendered", () => {
      expect(screen.queryByRole("heading")).toBeNull();
    });
  });
});
