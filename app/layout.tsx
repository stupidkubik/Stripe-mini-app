import type { Metadata } from "next";
import Providers from "./providers";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdant Lane",
  description: "A Stripe-powered houseplant boutique",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Verdant Lane — Houseplants with Stripe checkout",
    description:
      "Discover curated indoor plants and experience a full Stripe checkout flow in test mode.",
    siteName: "Verdant Lane",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Verdant Lane — Stripe-powered houseplant boutique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdant Lane",
    description: "Curated indoor plants with Stripe checkout in Next.js",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          <main id="content" className="page-container main-content">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
