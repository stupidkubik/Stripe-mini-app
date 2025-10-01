"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "./theme-toggle";
import { useCart } from "@/app/store/cart";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "bg-primary/15 text-foreground shadow-inner shadow-primary/10"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const cartCount = useCart((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const cartLabel =
    cartCount > 0
      ? `Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
      : "Open cart";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="page-container flex h-14 items-center gap-2 md:gap-3">
        <div className="flex flex-1 items-center gap-2 md:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 px-4"
              aria-labelledby="mobile-navigation-title"
            >
              <SheetTitle className="sr-only" id="mobile-navigation-title">
                Mobile navigation
              </SheetTitle>

              <nav className="mt-4 flex flex-col gap-2" aria-label="Mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent/70 hover:text-foreground"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-3">
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="font-semibold tracking-tight">
            Verdant&nbsp;Lane
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.href} {...n} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            className="relative h-10 w-auto min-w-[6.25rem] rounded-full border border-border/60 bg-background/70 px-0 text-sm font-medium shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Link
              href="/cart"
              aria-label={cartLabel}
              className="flex h-full w-full items-center justify-between gap-3 px-4"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShoppingCart className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">Cart</span>
              </span>
              {cartCount > 0 && (
                <span className="inline-flex min-w-[1.9rem] items-center justify-center rounded-full bg-primary/90 px-1.5 py-0.5 text-xs font-semibold leading-none text-primary-foreground shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
