import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JsonOutput } from "./JsonOutput.tsx";

vi.mock("@/components/code-editor/CodeEditor.tsx", () => ({
  CodeEditor: ({
    value,
    initialAriaLabel,
  }: {
    value: string;
    initialAriaLabel?: string;
  }) => <textarea aria-label={initialAriaLabel} value={value} readOnly />,
}));

const FORMATTED_JSON = '{\n  "a": 1\n}';

describe("Given the JSON output with an empty value", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(<JsonOutput value="" />);
    });

    it("then the placeholder should invite the user to run an action", () => {
      expect(
        screen.getByText(/o resultado aparecerá aqui/i),
      ).toBeInTheDocument();
    });

    it("then the read-only editor should be empty", () => {
      expect(screen.getByLabelText(/saída json formatada/i)).toHaveValue("");
    });
  });
});

describe("Given the JSON output with only whitespace", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(<JsonOutput value="   " />);
    });

    it("then the placeholder should still be displayed", () => {
      expect(
        screen.getByText(/o resultado aparecerá aqui/i),
      ).toBeInTheDocument();
    });
  });
});

describe("Given the JSON output with a formatted document", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(<JsonOutput value={FORMATTED_JSON} />);
    });

    it("then the placeholder should be removed", () => {
      expect(screen.queryByText(/o resultado aparecerá aqui/i)).toBeNull();
    });

    it("then the editor should display the result", () => {
      expect(screen.getByLabelText(/saída json formatada/i)).toHaveValue(
        FORMATTED_JSON,
      );
    });

    it("then the section should be titled as output", () => {
      expect(
        screen.getByRole("heading", { name: /saída/i }),
      ).toBeInTheDocument();
    });
  });
});
