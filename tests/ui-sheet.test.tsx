import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const { primitives } = vi.hoisted(() => ({
  primitives: {
    Root: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div data-primitive="root" {...props}>
        {children}
      </div>
    ),
    Trigger: ({ children, ...props }: React.ComponentProps<"button">) => (
      <button type="button" data-primitive="trigger" {...props}>
        {children}
      </button>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div data-primitive="portal">{children}</div>
    ),
    Close: ({ children, ...props }: React.ComponentProps<"button">) => (
      <button type="button" data-primitive="close" {...props}>
        {children}
      </button>
    ),
    Overlay: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div data-primitive="overlay" {...props}>
        {children}
      </div>
    ),
    Content: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div data-primitive="content" {...props}>
        {children}
      </div>
    ),
    Title: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div data-primitive="title" {...props}>
        {children}
      </div>
    ),
    Description: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div data-primitive="description" {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@radix-ui/react-dialog", () => primitives);

describe("Sheet UI", () => {
  it("renders sheet primitives with data slots", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Body</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("renders header/footer helpers and custom close", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>Header</SheetHeader>
          <SheetFooter>Footer</SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /dismiss/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-header"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="sheet-footer"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="sheet-close"]')).toBeTruthy();
  });

  it.each(["right", "left", "top", "bottom"])(
    "renders content for side %s",
    (side) => {
      const { unmount } = render(
        <Sheet>
          <SheetContent side={side as "right" | "left" | "top" | "bottom"}>
            Panel {side}
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText(`Panel ${side}`)).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-content"]'),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /close/i }),
      ).toBeInTheDocument();

      unmount();
    },
  );
});
