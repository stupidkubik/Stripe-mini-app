import Link from "next/link";

const FOOTER_LINK_GROUPS = [
  {
    heading: "Shop",
    links: [
      { href: "/products", label: "Catalog" },
      { href: "/cart", label: "Cart" },
      { href: "/success", label: "Order success" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
    ],
  },
];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="page-container py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Verdant Lane
            </Link>
            <p className="text-sm text-muted-foreground">
              A Stripe-powered greenhouse for your living room. Discover curated plants, manage your cart, and run the full checkout loop in minutes.
            </p>
            <div className="text-sm text-muted-foreground">
              Have a question? Email <a className="font-medium text-foreground underline-offset-4 hover:underline" href="mailto:support@verdantlane.dev">support@verdantlane.dev</a>
            </div>
          </div>

          <nav className="grid gap-8 sm:grid-cols-2" aria-label="Footer">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.heading} className="space-y-3">
                <div className="text-sm font-medium tracking-wide text-foreground">
                  {group.heading}
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link className="transition-colors hover:text-foreground" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Verdant Lane. All rights reserved.</p>
          <p>
            Built with Next.js & Stripe •{" "}
            <Link className="hover:underline" href="https://vercel.com" target="_blank" rel="noreferrer">
              Deployed on Vercel
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
