import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backendUrl = (process.env.BACKEND_API_URL || "http://localhost:3002").replace(
  /\/$/,
  ""
);

/**
 * Proxies `/api/*` to the Fastify backend with cookies and body forwarded.
 * Edge middleware rewrites do not reliably forward session cookies to an external
 * origin, which broke authenticated API calls from the browser.
 */
async function proxy(req: NextRequest, pathSegments: string[]) {
  const path = "/api/" + pathSegments.join("/");
  const url = backendUrl + path + req.nextUrl.search;

  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const method = req.method;
  const init: RequestInit = { method, headers, redirect: "manual" };

  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    init.body = await req.text();
  }

  const res = await fetch(url, init);

  const outHeaders = new Headers();
  const forward = ["content-type", "cache-control", "connection"];
  for (const h of forward) {
    const v = res.headers.get(h);
    if (v) outHeaders.set(h, v);
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204, headers: outHeaders });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream") && res.body) {
    return new NextResponse(res.body, { status: res.status, headers: outHeaders });
  }

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: outHeaders });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  return handle(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  return handle(req, ctx);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  return handle(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return handle(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  return handle(req, ctx);
}

export async function OPTIONS(req: NextRequest, ctx: RouteCtx) {
  return handle(req, ctx);
}
