import { describe, expect, it } from "vitest";

import {
  parsePositiveInt,
  readRequestText,
  RequestBodyTooLargeError,
} from "@/lib/request-body";

describe("request body limits", () => {
  it("uses only complete positive integer configuration values", () => {
    expect(parsePositiveInt(" 32 ", 16)).toBe(32);
    expect(parsePositiveInt("32bytes", 16)).toBe(16);
    expect(parsePositiveInt("0", 16)).toBe(16);
  });

  it("rejects a declared oversized body before reading it", async () => {
    const request = new Request("https://shop.example.com/api", {
      method: "POST",
      headers: { "content-length": "100" },
      body: "small",
    });

    await expect(readRequestText(request, 16)).rejects.toBeInstanceOf(
      RequestBodyTooLargeError,
    );
  });

  it("enforces the byte limit when content-length is absent", async () => {
    const request = new Request("https://shop.example.com/api", {
      method: "POST",
      body: "€€",
    });

    await expect(readRequestText(request, 5)).rejects.toBeInstanceOf(
      RequestBodyTooLargeError,
    );
  });

  it("returns an unchanged body at the exact byte limit", async () => {
    const request = new Request("https://shop.example.com/api", {
      method: "POST",
      body: "€€",
    });

    await expect(readRequestText(request, 6)).resolves.toBe("€€");
  });
});
