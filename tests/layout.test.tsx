import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/site-header", () => ({
  __esModule: true,
  default: () => <header data-testid="site-header" />,
}));

vi.mock("@/components/site-footer", () => ({
  __esModule: true,
  default: () => <footer data-testid="site-footer" />,
}));

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({ resolvedTheme: "light" }),
}));

const loadLayout = async () => await import("@/app/layout");

describe("App layout", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves metadataBase from the site origin", async () => {
    vi.stubEnv("SITE_URL", "https://shop.example.com/some/path");
    vi.resetModules();

    const { metadata } = await loadLayout();

    expect(String(metadata.metadataBase)).toBe("https://shop.example.com/");
  });

  it("wraps children with providers and layout chrome", async () => {
    const { default: RootLayout } = await loadLayout();

    const element = RootLayout({ children: <div data-testid="child" /> });
    const body = element.props.children as React.ReactElement<{
      className?: string;
      children: React.ReactNode;
    }>;

    expect(element.type).toBe("html");
    expect(element.props.lang).toBe("en");
    expect(body.type).toBe("body");
    expect(body.props.className).toBeUndefined();

    const { container } = render(body.props.children as React.ReactElement);

    expect(screen.getByTestId("site-header")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(container.querySelector("main#content")).toBeInTheDocument();
  });
});
