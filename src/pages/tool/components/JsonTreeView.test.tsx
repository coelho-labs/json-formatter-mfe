import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { JsonTreeView } from "./JsonTreeView.tsx";

describe("Given a JSON object in the tree view", () => {
  beforeEach(() => {
    render(
      <JsonTreeView
        value={{ name: "coelho", count: 2, active: true, empty: null }}
      />,
    );
  });

  describe("when the tree is mounted", () => {
    it("then the root should be expanded", () => {
      expect(
        screen.getByRole("button", { name: /recolher raiz/i }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("then object keys should be rendered as labels", () => {
      expect(screen.getByText("name:")).toBeInTheDocument();
      expect(screen.getByText("count:")).toBeInTheDocument();
    });

    it("then string values should be rendered with quotes", () => {
      expect(screen.getByText('"coelho"')).toBeInTheDocument();
    });

    it("then literal values should be rendered without quotes", () => {
      expect(screen.getByText("true")).toBeInTheDocument();
      expect(screen.getByText("null")).toBeInTheDocument();
    });
  });

  describe("when the root is collapsed", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /recolher raiz/i }),
      );
    });

    it("then the toggle should switch to expand", () => {
      expect(
        screen.getByRole("button", { name: /expandir raiz/i }),
      ).toHaveAttribute("aria-expanded", "false");
    });

    it("then the key count should be summarized", () => {
      expect(screen.getByText("{4 chaves}")).toBeInTheDocument();
    });

    it("then the children should be hidden", () => {
      expect(screen.queryByText("name:")).toBeNull();
    });
  });
});

describe("Given the root of the tree collapsed", () => {
  beforeEach(async () => {
    render(<JsonTreeView value={{ name: "coelho" }} />);
    await userEvent.click(
      screen.getByRole("button", { name: /recolher raiz/i }),
    );
  });

  describe("when the root is expanded again", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /expandir raiz/i }),
      );
    });

    it("then the children should be visible again", () => {
      expect(screen.getByText("name:")).toBeInTheDocument();
    });
  });
});

describe("Given a JSON array in the tree view", () => {
  beforeEach(() => {
    render(<JsonTreeView value={["primeiro", "segundo", "terceiro"]} />);
  });

  describe("when the tree is mounted", () => {
    it("then each item should be labelled by its index", () => {
      expect(screen.getByText("0:")).toBeInTheDocument();
      expect(screen.getByText("2:")).toBeInTheDocument();
    });

    it("then the root should be expandable", () => {
      expect(
        screen.getByRole("button", { name: /recolher raiz/i }),
      ).toBeInTheDocument();
    });
  });

  describe("when the root is collapsed", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /recolher raiz/i }),
      );
    });

    it("then the item count should be summarized", () => {
      expect(screen.getByText("[3 itens]")).toBeInTheDocument();
    });
  });
});

describe("Given nested JSON in the tree view", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ inner: { a: 1 } }} />);
  });

  describe("when the nested object is collapsed", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /recolher inner/i }),
      );
    });

    it("then the nested toggle should switch to expand", () => {
      expect(
        screen.getByRole("button", { name: /expandir inner/i }),
      ).toBeInTheDocument();
    });

    it("then the nested keys should be hidden", () => {
      expect(screen.queryByText("a:")).toBeNull();
    });

    it("then the nested key count should be summarized", () => {
      expect(screen.getByText("{1 chaves}")).toBeInTheDocument();
    });
  });
});

describe("Given a primitive root value", () => {
  describe("when the value is a number", () => {
    beforeEach(() => {
      render(<JsonTreeView value={42} />);
    });

    it("then the value should be rendered without a toggle", () => {
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("when the value is a string", () => {
    beforeEach(() => {
      render(<JsonTreeView value="texto" />);
    });

    it("then the value should be rendered with quotes", () => {
      expect(screen.getByText('"texto"')).toBeInTheDocument();
    });
  });
});
