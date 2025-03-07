import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_BASE = "next-auth.session-token";
const COOKIE_PATH = "/";
const SIGNIN_PATH = "/signin";

interface CookieConfig {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  secure?: boolean;
}

/**
 * Determines if the request is coming from a secure (HTTPS) connection
 * @param request - The incoming NextRequest object
 * @returns boolean indicating if the connection is secure
 */
const isSecureConnection = (request: NextRequest): boolean => {
  const referer = request.headers.get("referer") || request.nextUrl.href;
  try {
    return new URL(referer).protocol === "https:";
  } catch (error) {
    console.warn("Failed to parse referer URL:", error);
    return request.nextUrl.protocol === "https:";
  }
};

/**
 * Generates cookie configuration based on security status
 * @param isSecure - Whether the connection is secure
 * @returns CookieConfig object with appropriate settings
 */
const getCookieConfig = (isSecure: boolean): CookieConfig => ({
  name: `${isSecure ? "__Secure-" : ""}${SESSION_COOKIE_BASE}`,
  value: "deleted",
  maxAge: 0,
  path: COOKIE_PATH,
  ...(isSecure && { secure: true }),
});

/**
 * Formats cookie string according to RFC 6265
 * @param config - Cookie configuration object
 * @returns Formatted cookie string
 */
const formatCookieString = (config: CookieConfig): string => {
  const parts = [
    `${config.name}=${config.value}`,
    `Max-Age=${config.maxAge}`,
    `Path=${config.path}`,
  ];

  if (config.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
};

/**
 * Handles GET requests to sign out the user by clearing the session cookie
 * @param request - The incoming NextRequest object
 * @returns NextResponse with redirect and cleared cookie
 */
export function GET(request: NextRequest): NextResponse {
  try {
    const isSecure = isSecureConnection(request);
    const cookieConfig = getCookieConfig(isSecure);

    const response = NextResponse.redirect(
      new URL(SIGNIN_PATH, request.nextUrl)
    );

    response.headers.set("Set-Cookie", formatCookieString(cookieConfig));

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.redirect(new URL(SIGNIN_PATH, request.nextUrl));
  }
}
