import type { ImgHTMLAttributes } from "react";

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    const { style, alt, fill, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...rest}
        alt={alt ?? ""}
        style={{
          objectFit: "cover",
          ...(style as Record<string, unknown> | undefined),
        }}
      />
    );
  },
}));
