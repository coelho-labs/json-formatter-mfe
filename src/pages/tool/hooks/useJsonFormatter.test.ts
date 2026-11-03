import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useJsonFormatter } from "./useJsonFormatter.ts";

const VALID_INPUT = '{"b":1,"a":[3,2]}';

type FormatterView = { current: ReturnType<typeof useJsonFormatter> };

function mountFormatter(initialInput?: string): FormatterView {
  const { result } = renderHook(() => useJsonFormatter(initialInput));
  return result;
}

describe("Given the formatter mounted with an empty editor", () => {
  let view: FormatterView;

  beforeEach(() => {
    view = mountFormatter();
  });

  describe("when the initial state is observed", () => {
    it("then the input should be empty", () => {
      expect(view.current.input).toBe("");
    });

    it("then there should be no input or output available", () => {
      expect([view.current.hasInput, view.current.hasOutput]).toEqual([
        false,
        false,
      ]);
    });

    it("then the view should default to text", () => {
      expect(view.current.view).toBe("text");
    });

    it("then the tree view should be unavailable", () => {
      expect(view.current.canShowTree).toBe(false);
    });

    it("then there should be no validation result", () => {
      expect(view.current.validated).toBeNull();
    });

    it("then the copy status should be idle", () => {
      expect(view.current.copyStatus).toBe("idle");
    });
  });

  describe("when valid JSON is typed", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.setInput(VALID_INPUT);
      });
    });

    it("then the input should hold the typed text", () => {
      expect(view.current.input).toBe(VALID_INPUT);
    });

    it("then input availability should become true", () => {
      expect(view.current.hasInput).toBe(true);
    });

    it("then typing should clear any previous validation", () => {
      expect(view.current.validated).toBeNull();
    });
  });

  describe("when the tree view is requested without output", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.setView("tree");
        await Promise.resolve();
      });
    });

    it("then the view should fall back to text", () => {
      expect(view.current.view).toBe("text");
    });
  });

  describe("when an unreadable file is loaded", () => {
    let file: File;

    beforeEach(async () => {
      file = new File(["conteudo"], "dados.json", {
        type: "application/json",
      });
      vi.spyOn(file, "text").mockRejectedValue(new Error("read failure"));
      await act(async () => {
        await view.current.loadFile(file);
      });
    });

    it("then a file error should be reported", () => {
      expect(view.current.fileError).toBe("Não foi possível ler o arquivo.");
    });

    it("then the input should stay empty", () => {
      expect(view.current.input).toBe("");
    });
  });
});

describe("Given the formatter initialized with valid JSON", () => {
  let view: FormatterView;

  beforeEach(() => {
    view = mountFormatter(VALID_INPUT);
  });

  describe("when format is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.format();
      });
    });

    it("then the output should be indented with two spaces", () => {
      expect(view.current.output).toBe(
        ["{", '  "b": 1,', '  "a": [', "    3,", "    2", "  ]", "}"].join(
          "\n",
        ),
      );
    });

    it("then there should be no error", () => {
      expect(view.current.error).toBeNull();
    });

    it("then output availability should become true", () => {
      expect(view.current.hasOutput).toBe(true);
    });

    it("then the tree view should become available", () => {
      expect(view.current.canShowTree).toBe(true);
    });
  });

  describe("when minify is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.minify();
      });
    });

    it("then the output should be compact", () => {
      expect(view.current.output).toBe('{"b":1,"a":[3,2]}');
    });
  });

  describe("when sortKeys is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.sortKeys();
      });
    });

    it("then the keys should be alphabetically ordered", () => {
      expect(view.current.output).toBe(
        '{\n  "a": [\n    3,\n    2\n  ],\n  "b": 1\n}',
      );
    });
  });

  describe("when escape is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.escape();
      });
    });

    it("then the output should be a quoted JSON literal", () => {
      expect(view.current.output).toBe(JSON.stringify(VALID_INPUT));
    });
  });

  describe("when unescape is called on a JSON document", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.unescape();
      });
    });

    it("then the error should explain the expected string literal", () => {
      expect(view.current.error?.message).toBe(
        "A entrada não é um literal de string JSON válido",
      );
    });

    it("then the output should stay empty", () => {
      expect(view.current.output).toBe("");
    });
  });

  describe("when validate is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.validate();
      });
    });

    it("then the document should be marked as valid", () => {
      expect(view.current.validated).toBe(true);
    });

    it("then the output should not be filled", () => {
      expect(view.current.output).toBe("");
    });
  });

  describe("when the tree view is requested with valid output", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.format();
      });
      await act(async () => {
        view.current.setView("tree");
      });
    });

    it("then the view should switch to tree", () => {
      expect(view.current.view).toBe("tree");
    });

    it("then the parsed tree value should be available", () => {
      expect(view.current.treeValue).toEqual({ b: 1, a: [3, 2] });
    });
  });
});

describe("Given the formatter with a four-space indent selected", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter(VALID_INPUT);
    await act(async () => {
      view.current.setIndent(4);
    });
  });

  describe("when format is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.format();
      });
    });

    it("then nested values should be indented by four spaces", () => {
      expect(view.current.output).toContain('\n    "b": 1,');
    });
  });
});

describe("Given the formatter initialized with invalid JSON", () => {
  let view: FormatterView;

  beforeEach(() => {
    view = mountFormatter('{"a":1,}');
  });

  describe("when format is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.format();
      });
    });

    it("then the error message should be in pt-BR", () => {
      expect(view.current.error?.message).toBe(
        "Esperado nome de propriedade entre aspas duplas",
      );
    });

    it("then the output should stay empty", () => {
      expect(view.current.output).toBe("");
    });

    it("then output availability should remain false", () => {
      expect(view.current.hasOutput).toBe(false);
    });
  });

  describe("when validate is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.validate();
      });
    });

    it("then the document should be marked as invalid", () => {
      expect(view.current.validated).toBe(false);
    });

    it("then the parse error should be exposed", () => {
      expect(view.current.error).not.toBeNull();
    });
  });
});

describe("Given the formatter with formatted output", () => {
  let view: FormatterView;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    view = mountFormatter(VALID_INPUT);
    await act(async () => {
      view.current.format();
    });
  });

  describe("when copy is called and the clipboard accepts", () => {
    beforeEach(async () => {
      await act(async () => {
        await view.current.copy();
      });
    });

    it("then the output should be written to the clipboard", () => {
      expect(writeText).toHaveBeenCalledWith(view.current.output);
    });

    it("then the copy status should report success", () => {
      expect(view.current.copyStatus).toBe("copied");
    });
  });

  describe("when copy is called and the clipboard is unavailable", () => {
    beforeEach(async () => {
      writeText.mockRejectedValueOnce(new Error("denied"));
      await act(async () => {
        await view.current.copy();
      });
    });

    it("then the copy status should report a failure", () => {
      expect(view.current.copyStatus).toBe("error");
    });
  });

  describe("when the copied feedback expires", () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      await act(async () => {
        await view.current.copy();
      });
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("then the copy status should return to idle", () => {
      expect(view.current.copyStatus).toBe("idle");
    });
  });

  describe("when download is called", () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      createObjectURL = vi.fn(() => "blob:mock-output");
      revokeObjectURL = vi.fn();
      clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: createObjectURL,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: revokeObjectURL,
      });
      await act(async () => {
        view.current.download();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    });

    it("then the output should be converted into a JSON blob", () => {
      const blob = createObjectURL.mock.calls[0]?.[0] as Blob;

      expect(blob.type).toBe("application/json");
    });

    it("then an anchor should be clicked to trigger the download", () => {
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("then the file should be named json-formatted.json", () => {
      const anchor = clickSpy.mock.contexts[0] as HTMLAnchorElement;

      expect(anchor.download).toBe("json-formatted.json");
    });

    it("then the temporary object URL should be released", () => {
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-output");
    });
  });

  describe("when clear is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.clear();
      });
    });

    it("then the input and output should be emptied", () => {
      expect([view.current.input, view.current.output]).toEqual(["", ""]);
    });

    it("then the availability flags should be reset", () => {
      expect([view.current.hasInput, view.current.hasOutput]).toEqual([
        false,
        false,
      ]);
    });
  });
});

describe("Given the formatter with a readable file", () => {
  let view: FormatterView;

  beforeEach(async () => {
    const file = new File(['{"a":1}'], "dados.json", {
      type: "application/json",
    });
    view = mountFormatter();
    await act(async () => {
      await view.current.loadFile(file);
    });
  });

  describe("when the file is loaded", () => {
    it("then the file content should become the input", () => {
      expect(view.current.input).toBe('{"a":1}');
    });

    it("then no file error should be reported", () => {
      expect(view.current.fileError).toBeNull();
    });
  });
});

describe("Given the formatter initialized with valid JSON and a tab indent", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter(VALID_INPUT);
    await act(async () => {
      view.current.setIndent("\t");
    });
  });

  describe("when format is called", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.format();
      });
    });

    it("then the output should be indented with tabs", () => {
      expect(view.current.output).toContain('\t"b": 1,');
    });

    it("then the indent should remain as tab", () => {
      expect(view.current.indent).toBe("\t");
    });
  });
});

describe("Given the formatter with formatted output and unescape called on it", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter(VALID_INPUT);
    await act(async () => {
      view.current.format();
    });
    await act(async () => {
      view.current.unescape();
    });
  });

  it("then the output should be empty because formatted JSON is not a string literal", () => {
    expect(view.current.output).toBe("");
  });

  it("then the error should explain the expected string literal", () => {
    expect(view.current.error?.message).toBe(
      "A entrada não é um literal de string JSON válido",
    );
  });
});

describe("Given the formatter with an empty output", () => {
  let view: FormatterView;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    view = mountFormatter();
  });

  describe("when copy is called", () => {
    beforeEach(async () => {
      await act(async () => {
        await view.current.copy();
      });
    });

    it("then the clipboard should not be called", () => {
      expect(writeText).not.toHaveBeenCalled();
    });

    it("then the copy status should stay idle", () => {
      expect(view.current.copyStatus).toBe("idle");
    });
  });

  describe("when download is called", () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      createObjectURL = vi.fn(() => "blob:mock-output");
      clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: createObjectURL,
      });
      await act(async () => {
        view.current.download();
      });
    });

    it("then no blob should be created", () => {
      expect(createObjectURL).not.toHaveBeenCalled();
    });

    it("then no anchor should be clicked", () => {
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});

describe("Given the formatter with a validation error and tree view requested", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter('{"a":1,}');
    await act(async () => {
      view.current.setView("tree");
    });
  });

  it("then the view should fall back to text because there is an error", () => {
    expect(view.current.view).toBe("text");
  });

  it("then the tree view should be unavailable", () => {
    expect(view.current.canShowTree).toBe(false);
  });
});

describe("Given the formatter initialized with valid JSON", () => {
  let view: FormatterView;

  beforeEach(() => {
    view = mountFormatter(VALID_INPUT);
  });

  describe("when sortKeys is called with a four-space indent", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.setIndent(4);
      });
      await act(async () => {
        view.current.sortKeys();
      });
    });

    it("then the output should have four-space indentation", () => {
      expect(view.current.output).toContain('    "a": [');
    });

    it("then the keys should be alphabetically ordered", () => {
      expect(view.current.output).toContain('"a": [');
      expect(view.current.output).toContain('"b": 1');
    });
  });

  describe("when format is called on invalid JSON", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.setInput('{"a":1,}');
      });
      await act(async () => {
        view.current.format();
      });
    });

    it("then the error should be reported", () => {
      expect(view.current.error).not.toBeNull();
    });

    it("then the output should be empty", () => {
      expect(view.current.output).toBe("");
    });
  });

  describe("when validate is called on valid JSON", () => {
    beforeEach(async () => {
      await act(async () => {
        view.current.validate();
      });
    });

    it("then the document should be marked as valid", () => {
      expect(view.current.validated).toBe(true);
    });

    it("then there should be no error", () => {
      expect(view.current.error).toBeNull();
    });
  });
});

describe("Given the formatter with copy status already set", () => {
  let view: FormatterView;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    view = mountFormatter(VALID_INPUT);
    await act(async () => {
      view.current.format();
    });
    await act(async () => {
      await view.current.copy();
    });
  });

  describe("when copy is called again", () => {
    beforeEach(async () => {
      await act(async () => {
        await view.current.copy();
      });
    });

    it("then the copy status should be copied", () => {
      expect(view.current.copyStatus).toBe("copied");
    });

    it("then the clipboard should be called again", () => {
      expect(writeText).toHaveBeenCalledTimes(2);
    });
  });
});

describe("Given the formatter with state populated", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter(VALID_INPUT);
    await act(async () => {
      view.current.format();
    });
    await act(async () => {
      view.current.clear();
    });
  });

  it("then the input should be empty", () => {
    expect(view.current.input).toBe("");
  });

  it("then the output should be empty", () => {
    expect(view.current.output).toBe("");
  });

  it("then the error should be null", () => {
    expect(view.current.error).toBeNull();
  });

  it("then the validated state should be null", () => {
    expect(view.current.validated).toBeNull();
  });

  it("then the copy status should be idle", () => {
    expect(view.current.copyStatus).toBe("idle");
  });

  it("then the file error should be null", () => {
    expect(view.current.fileError).toBeNull();
  });
});

describe("Given the formatter with whitespace-only input", () => {
  let view: FormatterView;

  beforeEach(() => {
    view = mountFormatter("   ");
  });

  it("then hasInput should be false", () => {
    expect(view.current.hasInput).toBe(false);
  });
});

describe("Given the formatter with whitespace-only output", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter();
    await act(async () => {
      view.current.setInput("   ");
    });
  });

  it("then hasOutput should be false", () => {
    expect(view.current.hasOutput).toBe(false);
  });
});

describe("Given the formatter with no output and tree requested", () => {
  let view: FormatterView;

  beforeEach(async () => {
    view = mountFormatter();
    await act(async () => {
      view.current.setView("tree");
    });
    await Promise.resolve();
  });

  it("then the view should fall back to text", () => {
    expect(view.current.view).toBe("text");
  });

  it("then the tree view should be unavailable", () => {
    expect(view.current.canShowTree).toBe(false);
  });
});
