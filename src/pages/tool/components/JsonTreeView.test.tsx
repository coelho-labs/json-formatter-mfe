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

  describe("when the value is a boolean", () => {
    beforeEach(() => {
      render(<JsonTreeView value={true} />);
    });

    it("then the value should be rendered without quotes", () => {
      expect(screen.getByText("true")).toBeInTheDocument();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("when the value is null", () => {
    beforeEach(() => {
      render(<JsonTreeView value={null} />);
    });

    it("then the value should be rendered as null", () => {
      expect(screen.getByText("null")).toBeInTheDocument();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });
});

describe("Given an empty array in the tree view", () => {
  beforeEach(() => {
    render(<JsonTreeView value={[]} />);
  });

  describe("when the tree is mounted", () => {
    it("then the root should be expanded", () => {
      expect(
        screen.getByRole("button", { name: /recolher raiz/i }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("then the empty array brackets should be shown", () => {
      expect(screen.getByText("[").closest("div")).toBeInTheDocument();
      expect(screen.getByText("]").closest("div")).toBeInTheDocument();
    });
  });
});

describe("Given an empty object in the tree view", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{}} />);
  });

  describe("when the tree is mounted", () => {
    it("then the root should be expanded", () => {
      expect(
        screen.getByRole("button", { name: /recolher raiz/i }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("then the empty object braces should be shown", () => {
      expect(screen.getByText("{").closest("div")).toBeInTheDocument();
      expect(screen.getByText("}").closest("div")).toBeInTheDocument();
    });
  });
});

describe("Given an array with mixed types in the tree view", () => {
  beforeEach(() => {
    render(<JsonTreeView value={[1, "dois", true, null]} />);
  });

  describe("when the tree is mounted", () => {
    it("then each item should be rendered with its type-appropriate style", () => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText('"dois"')).toBeInTheDocument();
      expect(screen.getByText("true")).toBeInTheDocument();
      expect(screen.getByText("null")).toBeInTheDocument();
    });

    it("then each item should be labelled by its index", () => {
      expect(screen.getByText("0:")).toBeInTheDocument();
      expect(screen.getByText("3:")).toBeInTheDocument();
    });
  });
});

describe("Given a deeply nested object in the tree view", () => {
  beforeEach(() => {
    render(
      <JsonTreeView value={{ level1: { level2: { level3: "profundo" } } }} />,
    );
  });

  describe("when the intermediate node is collapsed", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /recolher level1/i }),
      );
    });

    it("then the deepest key should be hidden", () => {
      expect(screen.queryByText("level3:")).toBeNull();
    });

    it("then the intermediate node should show its key count", () => {
      expect(screen.getByText("{1 chaves}")).toBeInTheDocument();
    });

    it("then expanding the intermediate node should reveal the deepest key", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /expandir level1/i }),
      );
      expect(screen.getByText("level3:")).toBeInTheDocument();
    });
  });
});

describe("Given a tree view with a className", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ a: 1 }} className="minha-classe" />);
  });

  it("then the className should be applied to the container", () => {
    expect(screen.getByText("a:")).toBeInTheDocument();
  });
});

describe("Given a tree view with a string value labeled", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ chave: "valor" }} />);
  });

  describe("when it renders", () => {
    it("then the property label should be shown", () => {
      expect(screen.getByText("chave:")).toBeInTheDocument();
    });

    it("then the string value should be rendered with quotes", () => {
      expect(screen.getByText('"valor"')).toBeInTheDocument();
    });
  });
});

describe("Given a tree view with a number value labeled", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ idade: 42 }} />);
  });

  describe("when it renders", () => {
    it("then the property label should be shown", () => {
      expect(screen.getByText("idade:")).toBeInTheDocument();
    });

    it("then the number value should be rendered without quotes", () => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });
});

describe("Given a tree view with a boolean value labeled", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ ativo: true }} />);
  });

  describe("when it renders", () => {
    it("then the property label should be shown", () => {
      expect(screen.getByText("ativo:")).toBeInTheDocument();
    });

    it("then the boolean value should be rendered without quotes", () => {
      expect(screen.getByText("true")).toBeInTheDocument();
    });
  });
});

describe("Given a tree view with an array value labeled", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ itens: [1, 2, 3] }} />);
  });

  describe("when it renders", () => {
    it("then the property label should be shown", () => {
      expect(screen.getByText("itens:")).toBeInTheDocument();
    });

    it("then the array items should be expanded by default", () => {
      expect(screen.getByText("0:")).toBeInTheDocument();
      expect(screen.getByText("2:")).toBeInTheDocument();
    });
  });
});

describe("Given a tree view with an array node collapsed", () => {
  beforeEach(() => {
    render(<JsonTreeView value={[1, 2, 3]} />);
  });

  describe("when the root is collapsed", () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /recolher raiz/i }),
      );
    });

    it("then the items should be hidden", () => {
      expect(screen.queryByText("0:")).toBeNull();
      expect(screen.queryByText("1:")).toBeNull();
      expect(screen.queryByText("2:")).toBeNull();
    });

    it("then the item count summary should be shown", () => {
      expect(screen.getByText("[3 itens]")).toBeInTheDocument();
    });
  });
});

describe("Given a tree view with an array node expanded", () => {
  beforeEach(() => {
    render(<JsonTreeView value={[10, 20]} />);
  });

  describe("when it renders", () => {
    it("then each item should be labelled by index", () => {
      expect(screen.getByText("0:")).toBeInTheDocument();
      expect(screen.getByText("1:")).toBeInTheDocument();
    });

    it("then each item value should be shown", () => {
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
    });
  });
});

describe("Given a tree view without className", () => {
  beforeEach(() => {
    render(<JsonTreeView value={{ a: 1 }} />);
  });

  it("then the value should still be rendered", () => {
    expect(screen.getByText("a:")).toBeInTheDocument();
  });
});
