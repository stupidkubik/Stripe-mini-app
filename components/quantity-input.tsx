"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./quantity-input.module.css";

type QuantityInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
};

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
  id,
  ariaLabel = "Quantity",
  size = "md",
}: QuantityInputProps) {
  const clamp = React.useCallback(
    (next: number) =>
      Math.max(min, Math.min(max, Number.isNaN(next) ? min : next)),
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

  const sizeStyles = {
    sm: {
      wrapper: styles.sizeSm,
      button: styles.buttonSm,
      input: styles.inputSm,
    },
    md: {
      wrapper: styles.sizeMd,
      button: styles.buttonMd,
      input: styles.inputMd,
    },
    lg: {
      wrapper: styles.sizeLg,
      button: styles.buttonLg,
      input: styles.inputLg,
    },
  };

  const sizeClass = sizeStyles[size];

  return (
    <div className={cn(styles.wrapper, sizeClass.wrapper)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(styles.button, sizeClass.button)}
        onClick={() => handleSet(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <input
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        inputMode="numeric"
        pattern="[0-9]*"
        className={cn(styles.input, sizeClass.input)}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(styles.button, sizeClass.button)}
        onClick={() => handleSet(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}
