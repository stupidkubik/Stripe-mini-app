import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { getLastToasterProps, resetToasterProps } from "./test-utils/sonner";

const themeState = {
  resolvedTheme: "light" as "light" | "dark",
};

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: themeState.resolvedTheme,
  }),
}));

describe("Sonner Toaster wrapper", () => {
  beforeEach(() => {
    resetToasterProps();
    themeState.resolvedTheme = "light";
  });

  it("uses defaults and resolved theme", () => {
    render(<Toaster />);

    const props = getLastToasterProps();
    expect(props?.theme).toBe("light");
    expect(props?.position).toBe("top-right");
    expect(props?.expand).toBe(true);
    expect(props?.richColors).toBe(true);
    expect(props?.closeButton).toBe(true);
    expect(props?.duration).toBe(4000);
    expect(props?.className).toBe("toaster");
    expect(props?.toastOptions?.classNames?.toast).toBe("toast");
    expect(props?.style?.["--normal-bg"]).toBe("var(--popover)");
  });

  it("prefers explicit theme prop", () => {
    themeState.resolvedTheme = "light";

    render(<Toaster theme="dark" className="custom" />);

    const props = getLastToasterProps();
    expect(props?.theme).toBe("dark");
    expect(props?.className).toBe("toaster custom");
  });
});
