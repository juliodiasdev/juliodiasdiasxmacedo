import { LoginForm } from "@/components/admin/LoginForm";
import { signOut } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next, erro } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.3em] text-rose uppercase">Área privada</p>
        <h1 className="mt-3 font-serif text-4xl">Entrar no painel</h1>
        {erro === "sem-permissao" ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Esta conta não tem permissão de administrador.
            <form action={signOut} className="mt-3">
              <button className="underline">Sair desta conta</button>
            </form>
          </div>
        ) : (
          <LoginForm next={next ?? "/admin"} />
        )}
      </div>
    </main>
  );
}
