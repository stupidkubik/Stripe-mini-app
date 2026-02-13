import "server-only";

const LOCAL_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getSiteOrigin(): string {
  return (
    normalizeOrigin(process.env.SITE_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    LOCAL_ORIGIN
  );
}

export function isSuccessPreviewEnabled(): boolean {
  return process.env.DEMO_SUCCESS === "true";
}
