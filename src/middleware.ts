import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/webhooks(.*)",
]);

const isProfileRoute = createRouteMatcher(["/profile(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]); // NEW

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req)) {
    if (
      userId &&
      (req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/signup"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    // API routes should get a 401, not an HTML redirect
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Let API routes handle their own auth/business logic —
  // don't apply page-based onboarding gates to them.
  if (isApiRoute(req)) {
    return NextResponse.next();
  }

  const profileComplete =
    sessionClaims?.publicMetadata?.profileComplete === true;
  const phoneNumberId = sessionClaims?.publicMetadata?.phoneNumberId ?? null;

  if (!profileComplete && !isProfileRoute(req)) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  if (profileComplete && !phoneNumberId && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)",
    "/__clerk/:path*",
  ],
};
