export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (incoming.pathname === "/health") {
      return new Response("ok", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
    const upstream = new URL("https://ehzdoevqqmmtetulcpbo.supabase.co/functions/v1/harmonia-settings");
    upstream.pathname += incoming.pathname === "/" ? "" : incoming.pathname;
    upstream.search = incoming.search;
    const headers = new Headers(request.headers);
    headers.delete("host");
    const upstreamResponse = await fetch(new Request(upstream.toString(), {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual"
    }));
    const responseHeaders = new Headers(upstreamResponse.headers);
    if (request.method === "GET" && (incoming.pathname === "/" || incoming.pathname === "")) {
      responseHeaders.set("Content-Type", "text/html; charset=UTF-8");
      responseHeaders.set("Cache-Control", "no-store");
    }
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  }
};