"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import RenderProfiler from "@/components/dev/render-profiler";
import { Toaster } from "@/components/ui/sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RenderProfiler id="App">{children}</RenderProfiler>
      {/* Глобальные тосты для уведомлений */}
      <Toaster />
    </NextThemesProvider>
  );
}
