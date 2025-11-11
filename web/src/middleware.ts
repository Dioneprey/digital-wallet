import { NextRequest, NextResponse } from "next/server";
import { unauthenticatedRoutes } from "./common/constants/routes";
import authenticated from "./common/util/authenticated";
import setCookie from "set-cookie-parser";
import { API_URL } from "./common/constants/api";

function buildCookieHeader(cookies: { name: string; value: string }[]) {
  return cookies
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");
}

async function tryRefreshToken(req: NextRequest) {
  const hasRefresh = req.cookies.get("RefreshToken");
  if (!hasRefresh) return null;

  const cookieHeader = buildCookieHeader(req.cookies.getAll());

  try {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!refreshRes.ok) return null;

    const setCookieHeaders = refreshRes.headers.getSetCookie();
    if (!setCookieHeaders?.length) return null;

    return setCookie(setCookieHeaders);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isUnauthenticatedRoute = unauthenticatedRoutes.some((route) => {
    if (route.path === "/") {
      return path === "/";
    }
    return path.startsWith(route.path);
  });

  let userIsAuthenticated = await authenticated();

  if (!userIsAuthenticated) {
    const newCookies = await tryRefreshToken(request);

    if (newCookies) {
      const res = NextResponse.next();

      newCookies.forEach((cookie) => {
        res.cookies.set({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || "/",
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite as any,
          maxAge: cookie.maxAge,
          expires: cookie.expires,
        });
      });

      return res;
    }
  }

  if (!userIsAuthenticated && !isUnauthenticatedRoute) {
    return Response.redirect(new URL("/auth/login", request.url));
  }

  if ((userIsAuthenticated && path.startsWith("/auth")) || path === "/") {
    return Response.redirect(new URL("/wallet", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
