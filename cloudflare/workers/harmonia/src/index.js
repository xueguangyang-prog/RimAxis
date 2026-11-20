export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("ok", {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store"
        }
      });
    }
    return Response.redirect(
      "https://ehzdoevqqmmtetulcpbo.supabase.co/functions/v1/harmonia-settings",
      302
    );
  }
};
