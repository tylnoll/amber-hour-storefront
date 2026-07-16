function normalizeIp(raw: string) {
  let value = raw.trim();
  if (!value || value.toLowerCase() === "unknown") return "";

  // Strip RFC7239 forwarded wrapper: for="[2001:db8::1]:4711"
  value = value.replace(/^for=/i, "").replace(/^"|"$/g, "");

  // Remove square brackets around IPv6 literals.
  if (value.startsWith("[") && value.includes("]")) {
    value = value.slice(1, value.indexOf("]"));
  }

  // Normalize IPv4-mapped IPv6 values.
  if (value.startsWith("::ffff:")) {
    value = value.slice(7);
  }

  // Trim optional port from IPv4: 1.2.3.4:12345
  const ipv4WithPort = value.match(/^(\d+\.\d+\.\d+\.\d+):(\d+)$/);
  if (ipv4WithPort) {
    value = ipv4WithPort[1];
  }

  return value;
}

function parseForwardedHeader(forwarded: string) {
  const firstSegment = forwarded.split(",")[0] ?? "";
  const parts = firstSegment.split(";");
  for (const part of parts) {
    const [key, val] = part.split("=");
    if (!key || !val) continue;
    if (key.trim().toLowerCase() !== "for") continue;
    const parsed = normalizeIp(val);
    if (parsed) return parsed;
  }
  return "";
}

export function getClientIpInfoFromRequest(request: Request) {
  const forwarded = request.headers.get("forwarded");
  if (forwarded) {
    const parsed = parseForwardedHeader(forwarded);
    if (parsed) return { ip: parsed, source: "forwarded" };
  }

  const headerCandidates: Array<[string, string | null]> = [
    ["cf-connecting-ip", request.headers.get("cf-connecting-ip")],
    ["true-client-ip", request.headers.get("true-client-ip")],
    ["x-client-ip", request.headers.get("x-client-ip")],
    ["x-real-ip", request.headers.get("x-real-ip")],
    ["x-forwarded-for", request.headers.get("x-forwarded-for")],
  ];

  for (const [headerName, headerValue] of headerCandidates) {
    if (!headerValue) continue;
    const first = normalizeIp(headerValue.split(",")[0] ?? "");
    if (first) return { ip: first, source: headerName };
  }

  const host = new URL(request.url).hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return { ip: "127.0.0.1", source: "localhost-fallback" };
  }

  return { ip: "unknown", source: "unknown" };
}

export function getClientIpFromRequest(request: Request) {
  return getClientIpInfoFromRequest(request).ip;
}
