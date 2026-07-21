const DEFAULT_STOREFRONT_CURRENCY = "USD";

function normalizeCurrency(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase();
  return normalized && /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

export const STOREFRONT_CURRENCY =
  normalizeCurrency(process.env.NEXT_PUBLIC_STOREFRONT_CURRENCY) ??
  DEFAULT_STOREFRONT_CURRENCY;

export function isStorefrontCurrency(value: string | undefined): boolean {
  return normalizeCurrency(value) === STOREFRONT_CURRENCY;
}
