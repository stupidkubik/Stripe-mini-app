"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";

type ProvidersProps = {
  children: React.ReactNode;
  /** если позже добавишь SSR/SSG с TanStack Query, передавай dehydratedState
   * в <Providers dehydratedState={...}> из серверного компонента (через dehydrate(queryClient)). */
  dehydratedState?: DehydratedState;
};

export default function Providers({
  children,
  dehydratedState,
}: ProvidersProps) {
  // Создаём QueryClient один раз (на клиентах/перерендеры)
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // хорошие дефолты под UI
            staleTime: 60_000, // 1 минута
            gcTime: 5 * 60_000, // 5 минут
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          {children}
        </HydrationBoundary>

        {/* Глобальные тосты для уведомлений */}
        <Toaster />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
