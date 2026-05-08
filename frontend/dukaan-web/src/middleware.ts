import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = ["/admin"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isAdminPath(path: string) {
  return ADMIN_PATHS.some((p) => path.startsWith(p));
}

function isPublicAdminPath(path: string) {
  return PUBLIC_ADMIN_PATHS.some((p) => path === p);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname) && !isPublicAdminPath(pathname)) {
    // Middleware runs on server — can't read localStorage.
    // Auth check delegated to admin layout (client-side).
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
