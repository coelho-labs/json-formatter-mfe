import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JsonInput } from "./JsonInput.tsx";

vi.mock("@/components/code-editor/CodeEditor.tsx", () => ({
  CodeEditor: ({
    value,
    onChange,
    initialAriaLabel,
  }: {
    value: string;
    onChange?: (value: string) => void;
    initialAriaLabel?: string;
  }) => (
    <textarea
      aria-label={initialAriaLabel}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

const JSON_FILE = new File(['{"a":1}'], "dados.json", {
  type: "application/json",
});

function editor(): HTMLElement {
  return screen.getByLabelText(/editor json de entrada/i);
}

function dropZone(): HTMLElement {
  const zone = editor().parentElement;
  if (!zone) throw new Error("Drop zone not found");
  return zone;
}

function fileInput(): HTMLInputElement {
  return screen.getByLabelText(/ou arraste um arquivo/i) as HTMLInputElement;
}

function attachFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { configurable: true, value: files });
}

describe("Given the JSON input with an empty editor", () => {
  const onChange = vi.fn();
  const onLoadFile = vi.fn();

  beforeEach(() => {
    render(<JsonInput value="" onChange={onChange} onLoadFile={onLoadFile} />);
  });

  describe("when the user types in the editor", () => {
    beforeEach(() => {
      fireEvent.change(editor(), { target: { value: '{"a":1}' } });
    });

    it("then the typed value should be reported", () => {
      expect(onChange).toHaveBeenCalledWith('{"a":1}');
    });
  });

  describe("when the user clicks the upload button", () => {
    let clickSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      clickSpy = vi
        .spyOn(HTMLInputElement.prototype, "click")
        .mockImplementation(() => {});
      await userEvent.click(
        screen.getByRole("button", { name: /carregar arquivo/i }),
      );
    });

    it("then the hidden file input should be triggered", () => {
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("when a file is chosen in the hidden input", () => {
    beforeEach(() => {
      const input = fileInput();
      attachFiles(input, [JSON_FILE]);
      fireEvent.change(input);
    });

    it("then the selected file should be loaded", () => {
      expect(onLoadFile).toHaveBeenCalledWith(JSON_FILE);
    });

    it("then the file input should be reset", () => {
      expect(fileInput().value).toBe("");
    });
  });

  describe("when a file is dropped onto the editor", () => {
    beforeEach(() => {
      fireEvent.drop(dropZone(), { dataTransfer: { files: [JSON_FILE] } });
    });

    it("then the dropped file should be loaded", () => {
      expect(onLoadFile).toHaveBeenCalledWith(JSON_FILE);
    });

    it("then the drag overlay should be hidden again", () => {
      expect(screen.queryByText(/solte o arquivo aqui/i)).toBeNull();
    });
  });

  describe("when a file is dragged over the editor", () => {
    beforeEach(() => {
      fireEvent.dragOver(dropZone());
    });

    it("then the drop hint should be displayed", () => {
      expect(screen.getByText(/solte o arquivo aqui/i)).toBeInTheDocument();
    });
  });
});

describe("Given a drag in progress over the editor", () => {
  beforeEach(() => {
    render(<JsonInput value="" onChange={vi.fn()} onLoadFile={vi.fn()} />);
    fireEvent.dragOver(dropZone());
  });

  describe("when the drag leaves the editor", () => {
    beforeEach(() => {
      fireEvent.dragLeave(dropZone(), { relatedTarget: document.body });
    });

    it("then the drop hint should be hidden", () => {
      expect(screen.queryByText(/solte o arquivo aqui/i)).toBeNull();
    });
  });
});

describe("Given the JSON input with a file error", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(
        <JsonInput
          fileError="Não foi possível ler o arquivo."
          value=""
          onChange={vi.fn()}
          onLoadFile={vi.fn()}
        />,
      );
    });

    it("then the error should be announced as an alert", () => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /não foi possível ler o arquivo/i,
      );
    });
  });
});
