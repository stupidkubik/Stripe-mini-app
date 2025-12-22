type EntryInit = {
  target: Element;
  isIntersecting?: boolean;
  intersectionRatio?: number;
};

const observers: MockIntersectionObserver[] = [];

export class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  private callback: IntersectionObserverCallback;
  private elements = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    observers.push(this);
  }

  observe(target: Element) {
    this.elements.add(target);
  }

  unobserve(target: Element) {
    this.elements.delete(target);
  }

  disconnect() {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entries: EntryInit | EntryInit[]) {
    const now = Date.now();
    const list = Array.isArray(entries) ? entries : [entries];
    const normalized = list.map((entry) => {
      const rect = entry.target.getBoundingClientRect();
      const isIntersecting = entry.isIntersecting ?? true;
      const intersectionRatio =
        entry.intersectionRatio ?? (isIntersecting ? 1 : 0);

      return {
        boundingClientRect: rect,
        intersectionRatio,
        intersectionRect: isIntersecting ? rect : new DOMRect(),
        isIntersecting,
        rootBounds: null,
        target: entry.target,
        time: now,
      } as IntersectionObserverEntry;
    });

    this.callback(normalized, this);
  }
}

export function setupIntersectionObserverMock() {
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

export function resetIntersectionObservers() {
  observers.length = 0;
}

export function getIntersectionObservers() {
  return observers;
}
