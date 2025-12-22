import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

describe("Dialog UI", () => {
  it("renders dialog primitives with data slots", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-close"]')).toBeTruthy();
  });

  it("can hide the close button", () => {
    render(
      <DialogContent showCloseButton={false}>
        <div>Body</div>
      </DialogContent>,
    );

    expect(document.querySelector('[data-slot="dialog-close"]')).toBeNull();
  });

  it("applies overlay className", () => {
    render(<DialogOverlay className="custom" />);

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toHaveClass("custom");
  });
});
