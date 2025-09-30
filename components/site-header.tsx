"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* left: logo + nav */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            Verdant&nbsp;Lane
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.href} {...n} />
            ))}
          </nav>
        </div>

        {/* right: actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            asChild
            variant="outline"
            size="icon"
            className="relative h-10 w-10 rounded-full border-border/70 bg-background/80 p-0 hover:border-border hover:bg-accent/70"
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
                  className="absolute -right-1.5 -top-1.5 flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full bg-primary px-1 text-[0.75rem] font-medium text-primary-foreground shadow-sm"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {/* mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="mt-4 flex flex-col gap-2">
                  {NAV.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="rounded-md px-2 py-2 text-sm hover:bg-accent"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <div className="pt-2">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
