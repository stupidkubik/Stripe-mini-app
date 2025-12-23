import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class NotFoundError extends Error {}

const {
  listProductsMock,
  getProductBySlugMock,
  notFoundMock,
  productGridState,
  purchaseActionsState,
} = vi.hoisted(() => ({
  listProductsMock: vi.fn(),
  getProductBySlugMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new NotFoundError("not found");
  }),
  productGridState: {
    lastProps: null as null | { products: unknown[] },
  },
  purchaseActionsState: {
    lastProps: null as null | { product: unknown },
  },
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/lib/stripe", () => ({
  listProducts: listProductsMock,
  getProductBySlug: getProductBySlugMock,
}));

vi.mock("@/components/product-grid", () => ({
  ProductGrid: (props: { products: unknown[] }) => {
    productGridState.lastProps = props;
    return <div data-testid="product-grid" />;
  },
}));

vi.mock("@/components/product-purchase-actions", () => ({
  ProductPurchaseActions: (props: { product: unknown }) => {
    purchaseActionsState.lastProps = props;
    return <div data-testid="purchase-actions" />;
  },
}));

const loadProductsPage = async () => await import("@/app/products/page");
const loadProductDetailPage = async () =>
  await import("@/app/products/[slug]/page");

const product = {
  id: "prod_1",
  name: "Fern",
  description: "Leafy plant",
  image: "https://example.com/fern.png",
  priceId: "price_1",
  currency: "USD",
  unitAmount: 2500,
  metadata: {
    slug: "fern",
  },
};

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

describe("Products pages", () => {
  beforeEach(() => {
    listProductsMock.mockReset();
    getProductBySlugMock.mockReset();
    notFoundMock.mockClear();
    productGridState.lastProps = null;
    purchaseActionsState.lastProps = null;
  });

  afterEach(() => {
    if (ORIGINAL_SITE_URL === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
    }
  });

  it("renders empty catalog message", async () => {
    listProductsMock.mockResolvedValue([]);

    const { default: ProductsPage } = await loadProductsPage();

    const element = await ProductsPage();
    render(element);

    expect(
      screen.getByText(/products are not available at the moment/i),
    ).toBeInTheDocument();
  });

  it("renders product grid when products exist", async () => {
    listProductsMock.mockResolvedValue([product]);

    const { default: ProductsPage } = await loadProductsPage();

    const element = await ProductsPage();
    render(element);

    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(productGridState.lastProps?.products).toEqual([product]);
  });

  it("generates static params from products", async () => {
    listProductsMock.mockResolvedValue([
      { id: "prod_a", metadata: { slug: "aloe" } },
      { id: "prod_b" },
    ]);

    const { generateStaticParams } = await loadProductDetailPage();

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "aloe" },
      { slug: "prod_b" },
    ]);
  });

  it("generates metadata for missing product", async () => {
    getProductBySlugMock.mockResolvedValue(null);

    const { generateMetadata } = await loadProductDetailPage();

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "missing" }),
    });

    expect(metadata).toEqual({
      title: "Product not found",
      description: "The requested product could not be found.",
    });
  });

  it("generates metadata for product", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    getProductBySlugMock.mockResolvedValue(product);

    const { generateMetadata } = await loadProductDetailPage();

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "fern" }),
    });

    expect(metadata.title).toBe("Fern | Mini Shop");
    expect(metadata.alternates?.canonical).toBe("/products/fern");
    expect(metadata.openGraph?.url).toBe("https://example.com/products/fern");
    expect(metadata.openGraph?.images?.[0]?.url).toBe(product.image);
  });

  it("calls notFound when product is missing", async () => {
    getProductBySlugMock.mockResolvedValue(null);

    const { default: ProductDetailPage } = await loadProductDetailPage();

    await expect(
      ProductDetailPage({ params: Promise.resolve({ slug: "missing" }) }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders product details with description", async () => {
    getProductBySlugMock.mockResolvedValue(product);

    const { default: ProductDetailPage } = await loadProductDetailPage();

    const element = await ProductDetailPage({
      params: Promise.resolve({ slug: "fern" }),
    });

    render(element);

    expect(screen.getByRole("heading", { name: "Fern" })).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("Leafy plant")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to catalog/i }),
    ).toHaveAttribute("href", "/products");
    expect(screen.getByTestId("purchase-actions")).toBeInTheDocument();
    expect(purchaseActionsState.lastProps?.product).toEqual(product);
  });

  it("renders fallback description when missing", async () => {
    getProductBySlugMock.mockResolvedValue({
      ...product,
      description: null,
    });

    const { default: ProductDetailPage } = await loadProductDetailPage();

    const element = await ProductDetailPage({
      params: Promise.resolve({ slug: "fern" }),
    });

    render(element);

    expect(
      screen.getByText(/no description provided for this product yet/i),
    ).toBeInTheDocument();
  });
});
