"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuantityInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
};

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
  id,
  "aria-label": ariaLabel = "Quantity",
}: QuantityInputProps) {
  const clamp = React.useCallback(
    (next: number) => Math.max(min, Math.min(max, Number.isNaN(next) ? min : next)),
    [min, max],
  );

  const handleSet = React.useCallback(
    (next: number) => {
      onChange(clamp(next));
    },
    [clamp, onChange],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^0-9]/g, "");
    if (raw === "") {
      onChange(min);
      return;
    }
    handleSet(Number.parseInt(raw, 10));
  };

  const handleBlur = () => {
    handleSet(value);
  };

  return (
    <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-1 py-1 text-xs shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md sm:text-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => handleSet(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        inputMode="numeric"
        pattern="[0-9]*"
        className="h-8 w-11 border-0 bg-transparent px-0 text-center text-xs font-semibold tracking-wide sm:w-12 sm:text-sm focus-visible:ring-0"
        aria-label={ariaLabel}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => handleSet(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
