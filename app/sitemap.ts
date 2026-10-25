import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/config/server";
import { logServerError } from "@/lib/server-log";
import { listProducts } from "@/lib/stripe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const products = await listProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
      const slug = product.metadata?.slug ?? product.id;

      return {
        url: `${baseUrl}/products/${encodeURIComponent(slug)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      };
    });

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    logServerError("stripe.sitemap.generate", error);
    return staticRoutes;
  }
}
