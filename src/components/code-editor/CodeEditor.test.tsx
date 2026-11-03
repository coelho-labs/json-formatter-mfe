import { EditorView } from "@codemirror/view";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
