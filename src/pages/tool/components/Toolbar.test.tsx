import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { IndentOption, JsonError } from "@/lib/json.ts";
import { Toolbar } from "./Toolbar.tsx";

const noop = () => {};

const POSITIONED_ERROR: JsonError = {
  message: "Esperado ':' após o nome da propriedade",
  column: 5,
  line: 2,
  position: 12,
};

function renderToolbar(
  overrides: Partial<ComponentProps<typeof Toolbar>> = {},
): void {
  render(
    <Toolbar
      canShowTree={false}
      copyStatus="idle"
      error={null}
      hasInput
      hasOutput
      indent={2}
      validated={null}
      view="text"
      escape={noop}
      onClear={noop}
      onCopy={noop}
      onDownload={noop}
      onFormat={noop}
      onIndentChange={noop}
      onMinify={noop}
      onValidate={noop}
      setView={noop}
      sortKeys={noop}
      unescape={noop}
      {...overrides}
    />,
  );
}

function action(name: RegExp): HTMLElement {
  return screen.getByRole("button", { name });
}

describe("Given a toolbar with input and output available", () => {
  let onFormat: Mock<() => void>;
  let onValidate: Mock<() => void>;
  let onSortKeys: Mock<() => void>;
  let onMinify: Mock<() => void>;
  let onEscape: Mock<() => void>;
  let onUnescape: Mock<() => void>;
  let onCopy: Mock<() => void>;
  let onDownload: Mock<() => void>;
  let onClear: Mock<() => void>;

  beforeEach(() => {
    onFormat = vi.fn<() => void>();
    onValidate = vi.fn<() => void>();
    onSortKeys = vi.fn<() => void>();
    onMinify = vi.fn<() => void>();
    onEscape = vi.fn<() => void>();
    onUnescape = vi.fn<() => void>();
    onCopy = vi.fn<() => void>();
    onDownload = vi.fn<() => void>();
    onClear = vi.fn<() => void>();
    renderToolbar({
      escape: onEscape,
      onClear,
      onCopy,
      onDownload,
      onFormat,
      onMinify,
      onValidate,
      sortKeys: onSortKeys,
      unescape: onUnescape,
    });
  });

  describe("when format is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/formatar/i));
    });

    it("then the format action should be dispatched once", () => {
      expect(onFormat).toHaveBeenCalledTimes(1);
    });
  });

  describe("when validate is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/validar/i));
    });

    it("then the validate action should be dispatched once", () => {
      expect(onValidate).toHaveBeenCalledTimes(1);
    });
  });

  describe("when sort keys is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/ordenar chaves/i));
    });

    it("then the sort action should be dispatched once", () => {
      expect(onSortKeys).toHaveBeenCalledTimes(1);
    });
  });

  describe("when minify is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/minificar/i));
    });

    it("then the minify action should be dispatched once", () => {
      expect(onMinify).toHaveBeenCalledTimes(1);
    });
  });

  describe("when escape is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/^escape$/i));
    });

    it("then the escape action should be dispatched once", () => {
      expect(onEscape).toHaveBeenCalledTimes(1);
    });
  });

  describe("when unescape is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/unescape/i));
    });

    it("then the unescape action should be dispatched once", () => {
      expect(onUnescape).toHaveBeenCalledTimes(1);
    });
  });

  describe("when copy is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/copiar/i));
    });

    it("then the copy action should be dispatched once", () => {
      expect(onCopy).toHaveBeenCalledTimes(1);
    });
  });

  describe("when download is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/baixar/i));
    });

    it("then the download action should be dispatched once", () => {
      expect(onDownload).toHaveBeenCalledTimes(1);
    });
  });

  describe("when clear is clicked", () => {
    beforeEach(async () => {
      await userEvent.click(action(/limpar/i));
    });

    it("then the clear action should be dispatched once", () => {
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Given a toolbar without input", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      renderToolbar({ hasInput: false, hasOutput: false });
    });

    it("then the format action should be disabled", () => {
      expect(action(/formatar/i)).toBeDisabled();
    });

    it("then the validate action should be disabled", () => {
      expect(action(/validar/i)).toBeDisabled();
    });

    it("then the sort action should be disabled", () => {
      expect(action(/ordenar chaves/i)).toBeDisabled();
    });

    it("then the minify action should be disabled", () => {
      expect(action(/minificar/i)).toBeDisabled();
    });

    it("then the escape action should be disabled", () => {
      expect(action(/^escape$/i)).toBeDisabled();
    });

    it("then the unescape action should be disabled", () => {
      expect(action(/unescape/i)).toBeDisabled();
    });

    it("then the clear action should stay enabled", () => {
      expect(action(/limpar/i)).toBeEnabled();
    });
  });
});

describe("Given a toolbar without output", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      renderToolbar({ hasOutput: false });
    });

    it("then the copy action should be disabled", () => {
      expect(action(/copiar/i)).toBeDisabled();
    });

    it("then the download action should be disabled", () => {
      expect(action(/baixar/i)).toBeDisabled();
    });

    it("then the format action should stay enabled", () => {
      expect(action(/formatar/i)).toBeEnabled();
    });
  });
});

describe("Given a toolbar in text mode", () => {
  describe("when the tree view is not available", () => {
    beforeEach(() => {
      renderToolbar({ canShowTree: false, view: "text" });
    });

    it("then the mode toggle should be disabled", () => {
      expect(action(/modo/i)).toBeDisabled();
    });
  });

  describe("when the tree view is available", () => {
    let setView: Mock<(view: "text" | "tree") => void>;

    beforeEach(async () => {
      setView = vi.fn<(view: "text" | "tree") => void>();
      renderToolbar({ canShowTree: true, setView, view: "text" });
      await userEvent.click(action(/modo/i));
    });

    it("then switching should request the tree mode", () => {
      expect(setView).toHaveBeenCalledWith("tree");
    });
  });
});

describe("Given a toolbar in tree mode", () => {
  let setView: Mock<(view: "text" | "tree") => void>;

  beforeEach(async () => {
    setView = vi.fn<(view: "text" | "tree") => void>();
    renderToolbar({ canShowTree: true, setView, view: "tree" });
    await userEvent.click(action(/modo/i));
  });

  describe("when the mode toggle is clicked", () => {
    it("then switching should request the text mode", () => {
      expect(setView).toHaveBeenCalledWith("text");
    });
  });

  describe("when it renders", () => {
    it("then the toggle should be pressed", () => {
      expect(action(/modo/i)).toHaveAttribute("aria-pressed", "true");
    });
  });
});

describe("Given a toolbar reporting state", () => {
  describe("when the document is valid", () => {
    beforeEach(() => {
      renderToolbar({ validated: true });
    });

    it("then a valid badge should be announced", () => {
      expect(screen.getByText("JSON válido")).toBeInTheDocument();
    });
  });

  describe("when the document is invalid with a source position", () => {
    beforeEach(() => {
      renderToolbar({ error: POSITIONED_ERROR, validated: false });
    });

    it("then the error badge should include line and column", () => {
      expect(screen.getByText(/linha 2, coluna 5/)).toBeInTheDocument();
    });

    it("then the error badge should use the translated message", () => {
      expect(
        screen.getByText(/esperado ':' após o nome da propriedade/i),
      ).toBeInTheDocument();
    });
  });

  describe("when the document is invalid without a source position", () => {
    beforeEach(() => {
      renderToolbar({
        error: { ...POSITIONED_ERROR, column: -1, line: -1, position: -1 },
        validated: false,
      });
    });

    it("then the error badge should omit the position", () => {
      expect(screen.queryByText(/linha -1/i)).toBeNull();
    });
  });

  describe("when the copy succeeded", () => {
    beforeEach(() => {
      renderToolbar({ copyStatus: "copied" });
    });

    it("then the status should confirm the copy", () => {
      expect(
        screen.getByText(/copiado para a área de transferência/i),
      ).toBeInTheDocument();
    });

    it("then the copy button should confirm the action", () => {
      expect(action(/copiado/i)).toBeInTheDocument();
    });
  });

  describe("when the copy failed", () => {
    beforeEach(() => {
      renderToolbar({ copyStatus: "error" });
    });

    it("then the status should report the failure", () => {
      expect(screen.getByText(/falha ao copiar/i)).toBeInTheDocument();
    });
  });
});

describe("Given a toolbar with an indent selected", () => {
  let onIndentChange: Mock<(indent: IndentOption) => void>;

  beforeEach(() => {
    onIndentChange = vi.fn<(indent: IndentOption) => void>();
    renderToolbar({ indent: 2, onIndentChange });
  });

  describe("when the user selects the four-space indent", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("combobox", { name: /indentação/i }),
      );
      const option = await screen.findByRole("option", {
        name: /4 espaços/i,
      });
      await userEvent.click(option);
    });

    it("then the indent should be reported as a number", () => {
      expect(onIndentChange).toHaveBeenCalledWith(4);
    });
  });
});

describe("Given a toolbar with tooltips", () => {
  beforeEach(() => {
    renderToolbar();
  });

  describe("when the format action is hovered", () => {
    beforeEach(async () => {
      await userEvent.hover(action(/formatar/i));
    });

    it("then the hint should explain the action", async () => {
      expect(
        await screen.findByText(
          /embelezar com a indentação escolhida/i,
          {},
          {
            timeout: 3000,
          },
        ),
      ).toBeInTheDocument();
    });
  });
});

describe("Given a toolbar with tab indent selected", () => {
  beforeEach(() => {
    renderToolbar({ indent: "\t" });
  });

  describe("when it renders", () => {
    it("then the select should show Tab", () => {
      expect(
        screen.getByRole("combobox", { name: /indentação/i }),
      ).toHaveTextContent("Tab");
    });
  });
});

describe("Given a toolbar with indent 4 selected", () => {
  beforeEach(() => {
    renderToolbar({ indent: 4 });
  });

  describe("when it renders", () => {
    it("then the select should show 4", () => {
      expect(
        screen.getByRole("combobox", { name: /indentação/i }),
      ).toHaveTextContent("4");
    });
  });
});

describe("Given a toolbar with error positioned only on line", () => {
  beforeEach(() => {
    renderToolbar({
      error: { ...POSITIONED_ERROR, column: -1, position: -1 },
      validated: false,
    });
  });

  describe("when it renders", () => {
    it("then the error badge should omit the column", () => {
      expect(screen.queryByText(/coluna/)).toBeNull();
    });

    it("then the error badge should still show the message", () => {
      expect(
        screen.getByText(/esperado ':' após o nome da propriedade/i),
      ).toBeInTheDocument();
    });
  });
});

describe("Given a toolbar with error positioned only on column", () => {
  beforeEach(() => {
    renderToolbar({
      error: { ...POSITIONED_ERROR, line: -1, position: -1 },
      validated: false,
    });
  });

  describe("when it renders", () => {
    it("then the error badge should omit the line", () => {
      expect(screen.queryByText(/linha/)).toBeNull();
    });

    it("then the error badge should still show the message", () => {
      expect(
        screen.getByText(/esperado ':' após o nome da propriedade/i),
      ).toBeInTheDocument();
    });
  });
});

describe("Given a toolbar with error at line zero", () => {
  beforeEach(() => {
    renderToolbar({
      error: { ...POSITIONED_ERROR, line: 0, column: 5 },
      validated: false,
    });
  });

  describe("when it renders", () => {
    it("then the error badge should omit the position", () => {
      expect(screen.queryByText(/coluna 0/)).toBeNull();
    });
  });
});

describe("Given a toolbar with error at column zero", () => {
  beforeEach(() => {
    renderToolbar({
      error: { ...POSITIONED_ERROR, line: 2, column: 0 },
      validated: false,
    });
  });

  describe("when it renders", () => {
    it("then the error badge should omit the position", () => {
      expect(screen.queryByText(/linha 2/)).toBeNull();
    });
  });
});

describe("Given a toolbar in tree mode with tree available", () => {
  beforeEach(() => {
    renderToolbar({ canShowTree: true, view: "tree" });
  });

  describe("when it renders", () => {
    it("then the mode button should be enabled", () => {
      expect(screen.getByRole("button", { name: /modo/i })).not.toBeDisabled();
    });

    it("then the mode button should be pressed", () => {
      expect(screen.getByRole("button", { name: /modo/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("then the mode label should be Árvore", () => {
      expect(screen.getByText(/árvore/i)).toBeInTheDocument();
    });

    it("then the mode tooltip should say Ver em modo texto", async () => {
      await userEvent.hover(screen.getByRole("button", { name: /modo/i }));
      expect(await screen.findByText(/ver em modo texto/i)).toBeInTheDocument();
    });
  });
});

describe("Given a toolbar in text mode with tree unavailable", () => {
  beforeEach(() => {
    renderToolbar({ canShowTree: false, view: "text" });
  });

  describe("when it renders", () => {
    it("then the mode button should be disabled", () => {
      expect(screen.getByRole("button", { name: /modo/i })).toBeDisabled();
    });

    it("then the mode button should not be pressed", () => {
      expect(screen.getByRole("button", { name: /modo/i })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("then the mode label should be Texto", () => {
      expect(screen.getByText(/texto/i)).toBeInTheDocument();
    });

    it("then the mode tooltip should say Ver em árvore colapsável", async () => {
      await userEvent.hover(screen.getByRole("button", { name: /modo/i }));
      expect(
        await screen.findByText(/ver em árvore colapsável/i),
      ).toBeInTheDocument();
    });
  });
});

describe("Given a toolbar with validated false and no error", () => {
  beforeEach(() => {
    renderToolbar({ validated: false, error: null });
  });

  describe("when it renders", () => {
    it("then no invalid badge should be shown", () => {
      expect(screen.queryByText(/inválido/i)).toBeNull();
    });
  });
});
