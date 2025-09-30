import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-semibold">Verdant Lane</div>
            <p className="mt-2 text-sm text-muted-foreground">
              A Stripe-powered greenhouse for your living room. Explore curated plants and real checkout flows.
            </p>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Product</div>
            <ul className="space-y-1 text-sm">
              <li>
                <Link className="hover:underline" href="/products">
                  Catalog
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/cart">
                  Cart
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/success">
                  Order success
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Legal</div>
            <ul className="space-y-1 text-sm">
              <li>
                <Link className="hover:underline" href="/legal/terms">
                  Terms
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/legal/privacy">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Verdant Lane. All rights reserved.</p>
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
