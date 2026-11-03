import { StrictMode } from "react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.tsx";

const { createRoot, render } = vi.hoisted(() => {
  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  return { createRoot, render };
});

vi.mock("react-dom/client", () => ({ createRoot }));
vi.mock("./App.tsx", () => ({ default: () => null }));

describe("Given the application entry point", () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.resetModules();
    await import("./main.tsx");
  });

  describe("when it bootstraps", () => {
    it("then the app should be mounted into the root element", () => {
      const root = document.getElementById("root");

      expect(createRoot).toHaveBeenCalledWith(root);
    });

    it("then the app should be rendered inside StrictMode", () => {
      const element = render.mock.calls[0]?.[0] as ReactElement<{
        children: ReactElement;
      }>;

      expect(element.type).toBe(StrictMode);
    });

    it("then the application shell should be the single child", () => {
      const element = render.mock.calls[0]?.[0] as ReactElement<{
        children: ReactElement;
      }>;

      expect(element.props.children.type).toBe(App);
    });

    it("then the render should happen exactly once", () => {
      expect(render).toHaveBeenCalledTimes(1);
    });
  });
});
