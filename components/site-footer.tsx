import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./site-footer.module.css";

const FOOTER_LINK_GROUPS = [
  {
    heading: "Shop",
    links: [
      { href: "/", label: "Home" },
      { href: "/products", label: "Catalog" },
      { href: "/cart", label: "Cart" },
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
    <footer className={styles.footer}>
      <div className={cn("page-container", styles.container)}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link href="/" className={styles.brand}>
              Verdant Lane
            </Link>
            <p className={styles.muted}>
              A Stripe-powered greenhouse for your living room. Discover curated
              plants, manage your cart, and run the full checkout loop in
              minutes.
            </p>
            <div className={styles.muted}>
              Have a question? Email{" "}
              <a
                className={styles.contactLink}
                href="mailto:stupidkubik@gmail.com"
              >
                stupidkubik@gmail.com
              </a>
            </div>
          </div>

          <nav className={styles.nav} aria-label="Footer">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.heading} className={styles.group}>
                <div className={styles.groupTitle}>{group.heading}</div>
                <ul className={styles.linkList}>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link className={styles.link} href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p>© {currentYear} Verdant Lane. All rights reserved.</p>
          <p>
            Built with Next.js & Stripe •{" "}
            <Link
              className={styles.bottomLink}
              href="https://vercel.com"
              target="_blank"
              rel="noreferrer"
            >
              Deployed on Vercel
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
