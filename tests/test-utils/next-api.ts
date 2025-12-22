export function createJsonRequest(
  url: string,
  body: unknown,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return new Request(url, {
    ...init,
    method: init.method ?? "POST",
    headers,
    body: JSON.stringify(body),
  });
}

export function createTextRequest(
  url: string,
  body: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "text/plain");
  }

  return new Request(url, {
    ...init,
    method: init.method ?? "POST",
    headers,
    body,
  });
}
