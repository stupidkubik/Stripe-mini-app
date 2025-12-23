import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuantityInput } from "@/components/quantity-input";

describe("QuantityInput", () => {
  it("clamps input to min when non-numeric", () => {
    const onChange = vi.fn();

    render(
      <QuantityInput
        value={5}
        min={2}
        max={10}
        onChange={onChange}
        ariaLabel="Quantity"
      />,
    );

    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "abc" },
    });

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("clamps input to max when value exceeds range", () => {
    const onChange = vi.fn();

    render(
      <QuantityInput
        value={1}
        min={1}
        max={3}
        onChange={onChange}
        ariaLabel="Quantity"
      />,
    );

    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "10" },
    });

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("clamps NaN value on blur", () => {
    const onChange = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <QuantityInput
        value={Number.NaN}
        min={2}
        max={5}
        onChange={onChange}
        ariaLabel="Quantity"
      />,
    );

    fireEvent.blur(screen.getByLabelText("Quantity"));

    expect(onChange).toHaveBeenCalledWith(2);
    consoleSpy.mockRestore();
  });

  it("increments and decrements via buttons", () => {
    const onChange = vi.fn();

    render(
      <QuantityInput
        value={2}
        min={1}
        max={3}
        onChange={onChange}
        ariaLabel="Quantity"
        size="lg"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /increase quantity/i }));
    fireEvent.click(screen.getByRole("button", { name: /decrease quantity/i }));

    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 1);
  });
});
