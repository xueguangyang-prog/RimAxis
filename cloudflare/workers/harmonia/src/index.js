export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (incoming.pathname === "/") {\n      return Response.redirect(new URL("/login", request.url), 302);\n    }\n    if (incoming.pathname === "/health") {
      return new Response("ok", {headers: {"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
    }
    const target = new URL("https://ehzdoevqqmmtetulcpbo.supabase.co/functions/v1/harmonia-settings");
    if (incoming.pathname !== "/") target.pathname += incoming.pathname;
    target.search = incoming.search;
    const upstream = await fetch(new Request(target.toString(), {
      method: request.method,
      headers: request.headers,
      body: ["GET","HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual"
    }));
    const headers = new Headers(upstream.headers);
    if (request.method === "GET" && incoming.pathname === "/") {
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "no-store");
      headers.set("x-content-type-options", "nosniff");
    }
    return new Response(upstream.body, {status: upstream.status, statusText: upstream.statusText, headers});
  }
};