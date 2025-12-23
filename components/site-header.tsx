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
import styles from "./site-header.module.css";

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
      className={cn(styles.navLink, active && styles.navLinkActive)}
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
    <header className={styles.header}>
      <a href="#content" className={styles.skipLink}>
        Skip to content
      </a>

      <div className={cn("page-container", styles.inner)}>
        <div className={styles.left}>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={styles.menuButton}
                aria-label="Open navigation menu"
              >
                <Menu className={styles.menuIcon} />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={styles.sheetContent}
              aria-labelledby="mobile-navigation-title"
            >
              <SheetTitle className="sr-only" id="mobile-navigation-title">
                Mobile navigation
              </SheetTitle>

              <nav className={styles.mobileNav} aria-label="Mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={styles.mobileNavLink}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>

              <div>
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className={styles.brand}>
            Verdant&nbsp;Lane
          </Link>

          <nav className={styles.nav} aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.href} {...n} />
            ))}
          </nav>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />

          <Button asChild variant="ghost" className={styles.cartButton}>
            <Link
              href="/cart"
              aria-label={cartLabel}
              className={styles.cartLink}
            >
              <span className={styles.cartLabel}>
                <ShoppingCart className={styles.cartIcon} aria-hidden />
                <span className={styles.cartText}>Cart</span>
              </span>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
