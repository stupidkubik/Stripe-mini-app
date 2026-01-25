"use client";

import * as React from "react";

const enabled =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_RENDER_PROFILE === "1";

type ProfileStats = {
  count: number;
  total: number;
  max: number;
  last: number;
};

declare global {
  interface Window {
    __renderProfile?: Record<string, ProfileStats>;
  }
}

function recordStat(id: string, actualDuration: number) {
  if (typeof window === "undefined") {
    return;
  }

  const store = (window.__renderProfile ??= {});
  const existing = store[id];

  if (!existing) {
    store[id] = {
      count: 1,
      total: actualDuration,
      max: actualDuration,
      last: actualDuration,
    };
    return;
  }

  existing.count += 1;
  existing.total += actualDuration;
  existing.max = Math.max(existing.max, actualDuration);
  existing.last = actualDuration;
}

type RenderProfilerProps = {
  id: string;
  children: React.ReactNode;
};

export default function RenderProfiler({
  id,
  children,
}: RenderProfilerProps) {
  const onRender = React.useCallback<React.ProfilerOnRenderCallback>(
    (profileId, phase, actualDuration) => {
      recordStat(profileId, actualDuration);
      if (typeof window !== "undefined") {
        // Keep logs terse; aggregated stats are in window.__renderProfile.
        console.debug(
          `[profile] ${profileId} ${phase} ${actualDuration.toFixed(2)}ms`,
        );
      }
    },
    [],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <React.Profiler id={id} onRender={onRender}>
      {children}
    </React.Profiler>
  );
}
