import type { ImgHTMLAttributes } from "react";

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const { style, alt, ...rest } = props;
    const forward = { ...rest } as Record<string, unknown>;
    delete forward.fill;
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
