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
      className={[
        "text-sm px-2 py-1 rounded-md transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const cartCount = useCart((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    className="rounded-md px-2 py-2 text-sm hover:bg-accent"
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
            variant="outline"
            size="icon"
            className="relative h-10 w-10 overflow-hidden rounded-full border-border/60 bg-background/90 p-0 shadow-sm transition hover:border-border hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Link
              href="/cart"
              aria-label="Open cart"
              className="relative flex h-full w-full items-center justify-center"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  aria-label={`${cartCount} items in cart`}
                  className="absolute top-0 right-0 flex h-5 min-w-[1.25rem] -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-primary px-1 text-[0.7rem] font-semibold text-primary-foreground shadow-sm"
                >
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
