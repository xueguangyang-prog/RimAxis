async function hasValidSession(request) {
  try {
    const raw = request.headers.get("cookie") || "";
    const part = raw.split(";").map(x => x.trim()).find(x => x.startsWith("harmonia_session="));
    if (!part) return false;
    const token = decodeURIComponent(part.slice("harmonia_session=".length));
    const configResponse = await fetch("https://ehzdoevqqmmtetulcpbo.supabase.co/functions/v1/harmonia-settings/api/public-config", { headers: { "cache-control": "no-store" } });
    if (!configResponse.ok) return false;
    const config = await configResponse.json();
    if (!config.publishableKey || !config.supabaseUrl) return false;
    const userResponse = await fetch(config.supabaseUrl + "/auth/v1/user", {
      headers: { apikey: config.publishableKey, Authorization: "Bearer " + token }
    });
    return userResponse.ok;
  } catch {
    return false;
  }
}

function noStore(headers) {
  const next = new Headers(headers);
  next.set("cache-control", "no-store");
  next.set("x-content-type-options", "nosniff");
  next.set("referrer-policy", "no-referrer");
  return next;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("ok", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === "/") return Response.redirect(new URL("/login", request.url), 302);

    if (request.method === "GET" && ["/login", "/settings"].includes(url.pathname)) {
      if (url.pathname === "/settings" && !(await hasValidSession(request))) {
        return Response.redirect(new URL("/login", request.url), 303);
      }
      const assetRequest = new Request(new URL("/", request.url), request);
      const response = await env.ASSETS.fetch(assetRequest);
      const headers = noStore(response.headers);
      headers.set("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    if (["/auth/v1/signup", "/auth/v1/token"].includes(url.pathname) && request.method === "POST") {
      const origin = request.headers.get("origin");
      if (origin && origin !== url.origin) return new Response("Forbidden", { status: 403 });
      const target = new URL("https://ehzdoevqqmmtetulcpbo.supabase.co" + url.pathname);
      target.search = url.search;
      const headers = new Headers(request.headers);
      headers.delete("host");
      const upstream = await fetch(new Request(target.toString(), { method: "POST", headers, body: request.body, redirect: "manual" }));
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: noStore(upstream.headers) });
    }

    if (url.pathname.startsWith("/api/")) {
      const target = new URL("https://ehzdoevqqmmtetulcpbo.supabase.co/functions/v1/harmonia-settings" + url.pathname);
      target.search = url.search;
      const headers = new Headers(request.headers);
      headers.delete("host");
      const upstream = await fetch(new Request(target.toString(), {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual"
      }));
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: noStore(upstream.headers) });
    }

    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }
};
