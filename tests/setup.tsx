import type { ImgHTMLAttributes } from "react";

import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

import { resetMockHeaders } from "./test-utils/next-headers";
import {
  resetIntersectionObservers,
  setupIntersectionObserverMock,
} from "./test-utils/intersection-observer";

setupIntersectionObserverMock();

vi.mock("next/headers", async () => await import("./test-utils/next-headers"));
vi.mock("next/server", async () => await import("./test-utils/next-server"));
vi.mock("sonner", async () => await import("./test-utils/sonner"));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      priority?: boolean;
    },
  ) => {
    const { style, alt, priority, ...rest } = props;
    const forward = { ...rest } as Record<string, unknown>;
    delete forward.fill;
    delete forward.priority;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...(forward as ImgHTMLAttributes<HTMLImageElement>)}
        alt={alt ?? ""}
        style={{
          objectFit: "cover",
          ...(style as Record<string, unknown> | undefined),
        }}
      />
    );
  },
}));

afterEach(() => {
  resetMockHeaders();
  resetIntersectionObservers();
  vi.clearAllMocks();
});
