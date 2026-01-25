const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, locale: string) {
  const key = `${locale}:${currency}`;
  const cached = formatters.get(key);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  formatters.set(key, formatter);
  return formatter;
}

export function formatPrice(
  amountMinor: number,
  currency: string,
  locale = "en-US",
) {
  return getFormatter(currency, locale).format(amountMinor / 100);
}
