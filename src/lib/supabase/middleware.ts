import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If Supabase credentials are not configured, allow navigation with warning headers
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password");

  const isProtectedPage =
    path === "/" ||
    path.startsWith("/dashboard") ||
    path.startsWith("/todo") ||
    path.startsWith("/later") ||
    path.startsWith("/completed") ||
    path.startsWith("/archived") ||
    path.startsWith("/trash") ||
    path.startsWith("/settings");

  if (!user && isProtectedPage && path !== "/login" && path !== "/register") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    if (path !== "/") {
      redirectUrl.searchParams.set("redirect", path);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
