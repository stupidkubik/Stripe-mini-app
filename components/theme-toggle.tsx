"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import styles from "./theme-toggle.module.css";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useHydrated();

  // во время гидратации скрываем иконки, чтобы избежать рассинхрона
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={styles.toggleButton}
        aria-label="Toggle theme"
      >
        <Sun className={styles.icon} />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={styles.toggleButton}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className={styles.icon} />
      ) : (
        <Moon className={styles.icon} />
      )}
    </Button>
  );
}
