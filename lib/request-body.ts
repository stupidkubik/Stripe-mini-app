import "server-only";

export class RequestBodyTooLargeError extends Error {
  readonly limitBytes: number;

  constructor(limitBytes: number) {
    super(`Request body exceeds the ${limitBytes}-byte limit.`);
    this.name = "RequestBodyTooLargeError";
    this.limitBytes = limitBytes;
  }
}

export function parsePositiveInt(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseContentLength(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export async function readRequestText(
  request: Request,
  limitBytes: number,
): Promise<string> {
  const contentLength = parseContentLength(
    request.headers.get("content-length"),
  );

  if (contentLength !== null && contentLength > limitBytes) {
    throw new RequestBodyTooLargeError(limitBytes);
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      totalBytes += value.byteLength;
      if (totalBytes > limitBytes) {
        await reader.cancel();
        throw new RequestBodyTooLargeError(limitBytes);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}
