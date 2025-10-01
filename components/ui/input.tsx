import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-md border bg-background/60 px-3 py-2 text-base shadow-xs transition-all duration-200 outline-none backdrop-blur-sm file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-primary/50 hover:shadow-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] focus-visible:-translate-y-px",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
