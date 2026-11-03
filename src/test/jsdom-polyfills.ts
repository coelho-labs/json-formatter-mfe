/**
 * Lacunas do jsdom exigidas pela infra de teste — nunca importado por código
 * de produção. O jsdom não implementa layout nem observers, e o CodeMirror 6
 * (medição de linhas) e o Base UI (Select/Tooltip) quebram na montagem sem eles.
 *
 * Cada polyfill é condicional: se uma versão futura do jsdom passar a
 * implementar a API, a implementação nativa é preservada.
 */

const EMPTY_RECT: DOMRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

function noop(): void {}

if (typeof Range.prototype.getClientRects !== "function") {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
}

if (typeof Range.prototype.getBoundingClientRect !== "function") {
  Range.prototype.getBoundingClientRect = () => EMPTY_RECT;
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = noop;
}

if (typeof Element.prototype.setPointerCapture !== "function") {
  Element.prototype.setPointerCapture = noop;
  Element.prototype.releasePointerCapture = noop;
  Element.prototype.hasPointerCapture = () => false;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub implements ResizeObserver {
    disconnect(): void {}
    observe(): void {}
    unobserve(): void {}
  }

  globalThis.ResizeObserver = ResizeObserverStub;
}

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
