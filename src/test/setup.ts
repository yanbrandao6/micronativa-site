import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", { value: ResizeObserverMock });
Object.defineProperty(Element.prototype, "scrollIntoView", { value: () => undefined, writable: true });
Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { value: () => false, writable: true });
Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { value: () => undefined, writable: true });
Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { value: () => undefined, writable: true });
