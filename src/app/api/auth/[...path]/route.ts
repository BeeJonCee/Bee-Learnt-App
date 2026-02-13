import { NextResponse } from "next/server";

const authBaseUrl =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL ?? process.env.NEON_AUTH_BASE_URL;

function buildTargetUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const suffix = requestUrl.pathname.replace(/^\/api\/auth\/?/, "");
  const base = authBaseUrl?.replace(/\/+$/, "");
  return `${base}${suffix ? `/${suffix}` : ""}${requestUrl.search}`;
}

async function forwardRequest(request: Request) {
  if (!authBaseUrl) {
    return NextResponse.json(
      { message: "Auth endpoint is not configured" },
      { status: 500 },
    );
  }

  const targetUrl = buildTargetUrl(request);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request) {
  return forwardRequest(request);
}

export async function POST(request: Request) {
  return forwardRequest(request);
}

export async function PATCH(request: Request) {
  return forwardRequest(request);
}

export async function PUT(request: Request) {
  return forwardRequest(request);
}

export async function DELETE(request: Request) {
  return forwardRequest(request);
}
