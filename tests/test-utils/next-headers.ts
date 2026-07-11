import { vi } from "vitest";

let currentHeaders = new Headers();
let currentCookies = new Map<string, string>();

export const headers = vi.fn(() => currentHeaders);
export const cookies = vi.fn(() => ({
  get: (name: string) => {
    const value = currentCookies.get(name);
    return value === undefined ? undefined : { name, value };
  },
}));

export function setMockHeaders(init: HeadersInit = {}) {
  currentHeaders = new Headers(init);
}

export function resetMockHeaders() {
  currentHeaders = new Headers();
  currentCookies = new Map();
}

export function setMockCookies(values: Record<string, string> = {}) {
  currentCookies = new Map(Object.entries(values));
}
