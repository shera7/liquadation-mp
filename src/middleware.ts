import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const PROTECTED_API_RULES: { prefix: string; methods: string[] }[] = [
  { prefix: "/api/products", methods: ["POST", "PATCH", "DELETE"] },
  { prefix: "/api/categories", methods: ["POST", "PATCH", "DELETE"] },
  { prefix: "/api/requests", methods: ["GET", "PATCH"] },
  { prefix: "/api/admin", methods: ["GET", "POST", "PATCH", "DELETE"] },
];

const FULL_ONLY_PREFIXES = [
  "/admin/employees",
  "/api/admin/employees",
  "/admin/settings",
  "/api/admin/settings",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  console.log("[middleware]", pathname, "token present:", Boolean(token), "session valid:", Boolean(session));

  const isAdminPage = pathname.startsWith("/admin");
  const apiRule = PROTECTED_API_RULES.find(
    (r) => pathname.startsWith(r.prefix) && r.methods.includes(req.method)
  );
  const needsAuth = isAdminPage || Boolean(apiRule);

  if (needsAuth && !session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const needsFull = FULL_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsFull && session?.role !== "FULL") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/requests/:path*",
    "/api/admin/:path*",
  ],
};
