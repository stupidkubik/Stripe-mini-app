import { vi } from "vitest";

let currentHeaders = new Headers();

export const headers = vi.fn(() => currentHeaders);

export function setMockHeaders(init: HeadersInit = {}) {
  currentHeaders = new Headers(init);
}

export function resetMockHeaders() {
  currentHeaders = new Headers();
}
