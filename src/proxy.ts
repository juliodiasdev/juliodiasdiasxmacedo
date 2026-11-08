import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Protege /admin e /preview: renova a sessão do Supabase e redireciona
 * visitantes não autenticados para o login. A autorização final (ser admin)
 * é verificada no servidor em cada página e ação, e pelo RLS no banco.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  // Sem Supabase o painel mostra as instruções de configuração; a prévia não existe.
  if (!url || !key) {
    if (pathname.startsWith("/preview")) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  if (user && isLogin && !request.nextUrl.searchParams.has("erro")) return NextResponse.redirect(new URL("/admin", request.url));

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/preview/:path*", "/preview"],
};
