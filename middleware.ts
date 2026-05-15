// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/actions")) {
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("X-Action-Version", "2.1.3");
    res.headers.set(
      "X-Blockchain-Ids",
      "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    );
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/actions/:path*", "/actions.json", "/api/actions.json"],
};
