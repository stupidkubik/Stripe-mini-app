'use client';

import * as React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';

// утилита для склейки классов (если у тебя есть своя — замени)
const cn = (...cls: Array<string | undefined>) => cls.filter(Boolean).join(' ');

// позволяем CSS custom props типобезопасно
type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

type Props = ToasterProps & {
  className?: string;
  style?: CSSVars;
};

export function Toaster({
  className,
  style,
  theme: themeProp,
  position,
  expand,
  richColors,
  closeButton,
  duration,
  toastOptions,
  ...rest
}: Props) {
  const { resolvedTheme } = useTheme();

  // дефолты с возможностью оверрайда пропсами
  const finalTheme: ToasterProps['theme'] =
    themeProp ?? (resolvedTheme as 'light' | 'dark' | 'system')

  const cssVars: CSSVars = {
    '--normal-bg': 'var(--popover)',
    '--normal-text': 'var(--popover-foreground)',
    '--normal-border': 'var(--border)',
    // при желании добавь варианты для success/warning/destructive
    // '--success-bg': '...',
    // '--error-bg': '...',
    ...style,
  };

  return (
    <Sonner
      {...rest}
      theme={finalTheme}
      position={position ?? 'top-right'}
      expand={expand ?? true}
      richColors={richColors ?? true}
      closeButton={closeButton ?? true}
      duration={duration ?? 4000}
      className={cn('toaster group shadow-lg', className)}
      style={cssVars}
      toastOptions={{
        ...toastOptions,
        // пример: общий класс для всех тостов (если нужно):
        classNames: {
          ...toastOptions?.classNames,
          toast: cn('border bg-[var(--normal-bg)] text-[var(--normal-text)]'),
        },
      }}
    />
  );
}
