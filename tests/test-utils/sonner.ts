import * as React from "react";
import { vi } from "vitest";

type ToastFn = ReturnType<typeof vi.fn> & {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warning: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
};

const toast = Object.assign(vi.fn(), {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  dismiss: vi.fn(),
}) as ToastFn;

export type ToasterProps = Record<string, unknown>;

let lastToasterProps: ToasterProps | null = null;

export function Toaster(props: ToasterProps) {
  lastToasterProps = props;
  return null;
}

export function getLastToasterProps() {
  return lastToasterProps;
}

export function resetToasterProps() {
  lastToasterProps = null;
}

export { toast };
