type JsonBody =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

function buildHeaders(init?: HeadersInit) {
  return new Headers(init);
}

export class NextResponse extends Response {
  static json(body: JsonBody, init?: ResponseInit) {
    const headers = buildHeaders(init?.headers);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers,
    });
  }
}
