import { EditorView } from "@codemirror/view";
import { diagnosticCount, forEachDiagnostic, forceLinting } from "@codemirror/lint";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { CodeEditor } from "./CodeEditor.tsx";

const INITIAL_DOC = '{"a":1}';
const UPDATED_DOC = '{"a":2}';

function viewOf(container: HTMLElement): EditorView {
  const editor = container.querySelector(".cm-editor");
  if (!editor) throw new Error("CodeMirror editor element not found");
  const view = EditorView.findFromDOM(editor as HTMLElement);
  if (!view) throw new Error("CodeMirror view not found");
  return view;
}

describe("Given a code editor with initial content", () => {
  let container: HTMLElement;
  let rerender: (ui: React.ReactElement) => void;
  const onChange = vi.fn();

  beforeEach(() => {
    ({ container, rerender } = render(
      <CodeEditor
        value={INITIAL_DOC}
        onChange={onChange}
        initialAriaLabel="Editor JSON de entrada"
      />,
    ));
  });

  describe("when it is mounted", () => {
    it("then the initial document should be rendered in the textbox", () => {
      expect(
        screen.getByRole("textbox", { name: /editor json de entrada/i }),
      ).toHaveTextContent(INITIAL_DOC);
    });

    it("then the textbox should expose the given aria label", () => {
      expect(
        screen.getByRole("textbox", { name: /editor json de entrada/i }),
      ).toBeInTheDocument();
    });

    it("then line numbers should be rendered", () => {
      expect(container.querySelector(".cm-gutters")).not.toBeNull();
    });

    it("then it should not report a change on mount", () => {
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("when the value prop changes", () => {
    beforeEach(() => {
      rerender(
        <CodeEditor
          value={UPDATED_DOC}
          onChange={onChange}
          initialAriaLabel="Editor JSON de entrada"
        />,
      );
    });

    it("then the textbox should show the updated document", () => {
      expect(
        screen.getByRole("textbox", { name: /editor json de entrada/i }),
      ).toHaveTextContent(UPDATED_DOC);
    });
  });

  describe("when the document is edited inside the editor", () => {
    beforeEach(() => {
      const view = viewOf(container);
      act(() => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: UPDATED_DOC },
        });
      });
    });

    it("then the change should be reported with the new document", () => {
      expect(onChange).toHaveBeenCalledWith(UPDATED_DOC);
    });

    it("then the textbox should reflect the new document", () => {
      expect(
        screen.getByRole("textbox", { name: /editor json de entrada/i }),
      ).toHaveTextContent(UPDATED_DOC);
    });
  });
});

describe("Given a read-only code editor", () => {
  describe("when it is mounted", () => {
    beforeEach(() => {
      render(
        <CodeEditor
          value={INITIAL_DOC}
          readOnly
          initialAriaLabel="Saída JSON formatada"
        />,
      );
    });

    it("then the textbox should be marked as read-only", () => {
      expect(
        screen.getByRole("textbox", { name: /saída json formatada/i }),
      ).toHaveAttribute("aria-readonly", "true");
    });

    it("then the content should not be editable", () => {
      expect(
        screen.getByRole("textbox", { name: /saída json formatada/i }),
      ).toHaveAttribute("contenteditable", "false");
    });
  });
});

describe("Given an editable code editor", () => {
  describe("when the readOnly prop becomes true", () => {
    beforeEach(() => {
      const { rerender } = render(<CodeEditor value={INITIAL_DOC} />);
      rerender(<CodeEditor value={INITIAL_DOC} readOnly />);
    });

    it("then the existing view should switch to read-only", () => {
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-readonly",
        "true",
      );
    });
  });
});

describe("Given a code editor with JSON lint enabled", () => {
  describe("when it renders invalid JSON", () => {
    beforeEach(() => {
      render(<CodeEditor value='{"a":}' lintJson initialAriaLabel="Editor" />);
    });

    it("then the editor should stay mounted with the invalid document", () => {
      expect(
        screen.getByRole("textbox", { name: /editor/i }),
      ).toHaveTextContent('{"a":}');
    });
  });
});

describe("Given an editor mounted with a first change handler", () => {
  let container: HTMLElement;
  let rerender: (ui: React.ReactElement) => void;
  let firstOnChange: Mock<(value: string) => void>;
  let secondOnChange: Mock<(value: string) => void>;

  beforeEach(() => {
    firstOnChange = vi.fn<(value: string) => void>();
    secondOnChange = vi.fn<(value: string) => void>();
    ({ container, rerender } = render(
      <CodeEditor value={INITIAL_DOC} onChange={firstOnChange} />,
    ));
  });

  describe("when the handler is replaced and the document is edited", () => {
    beforeEach(() => {
      rerender(<CodeEditor value={INITIAL_DOC} onChange={secondOnChange} />);
      const view = viewOf(container);

      act(() => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: UPDATED_DOC },
        });
      });
    });

    it("then the latest handler should be notified", () => {
      expect(secondOnChange).toHaveBeenCalledWith(UPDATED_DOC);
    });

    it("then the replaced handler should not be notified", () => {
      expect(firstOnChange).not.toHaveBeenCalled();
    });
  });
});

describe("Given an editor mounted without a change handler", () => {
  let container: HTMLElement;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    ({ container } = render(<CodeEditor value={INITIAL_DOC} />));
  });

  describe("when the document is edited", () => {
    beforeEach(() => {
      const view = viewOf(container);

      act(() => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: UPDATED_DOC },
        });
      });
    });

    it("then the edit should be applied without a handler", () => {
      expect(viewOf(container).state.doc.toString()).toBe(UPDATED_DOC);
    });

    it("then no update listener error should be logged", () => {
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});

describe("Given a mounted editor", () => {
  let unmount: () => void;
  let destroySpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    ({ unmount } = render(<CodeEditor value={INITIAL_DOC} />));
    destroySpy = vi.spyOn(EditorView.prototype, "destroy");
  });

  describe("when it is unmounted", () => {
    beforeEach(() => {
      unmount();
    });

    it("then the CodeMirror view should be destroyed", () => {
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Given a mounted editor with the tab keymap", () => {
  let container: HTMLElement;

  beforeEach(() => {
    ({ container } = render(<CodeEditor value={INITIAL_DOC} />));
  });

  describe("when tab is pressed in the document", () => {
    beforeEach(() => {
      const view = viewOf(container);

      view.contentDOM.focus();
      fireEvent.keyDown(view.contentDOM, { key: "Tab" });
    });

    it("then the current line should be indented", () => {
      expect(viewOf(container).state.doc.toString()).toBe(
        `  ${INITIAL_DOC}`,
      );
    });
  });
});

describe("Given an editor with JSON lint enabled showing invalid JSON", () => {
  let container: HTMLElement;

  beforeEach(async () => {
    ({ container } = render(
      <CodeEditor value='{"a":}' lintJson initialAriaLabel="Editor" />,
    ));
    await act(async () => {
      forceLinting(viewOf(container));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  describe("when the linter runs", () => {
    it("then a single diagnostic should be reported", () => {
      expect(diagnosticCount(viewOf(container).state)).toBe(1);
    });

    it("then the diagnostic message should be translated", () => {
      const messages: string[] = [];

      forEachDiagnostic(viewOf(container).state, (diagnostic) => {
        messages.push(diagnostic.message);
      });

      expect(messages).toEqual(['Token inesperado "}"']);
    });
  });
});
