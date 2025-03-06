import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const isSecure = request.headers.get("x-forward-proto") === "https";
  const cookiePrefix = isSecure ? "__Secure-" : "";
  const cookieName = cookiePrefix + "next-auth.session-token";

  const response = NextResponse.redirect(new URL("/", request.nextUrl));
  response.headers.set(
    "Set-Cookie",
    `${cookieName}=deleted; Max-Age=0; path=/${isSecure ? "; Secure " : ""}`
  );
  return response;
}
