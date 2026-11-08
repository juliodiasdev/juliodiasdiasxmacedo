import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Garante que quem está chamando é o administrador.
 * Duas verificações: o usuário está na tabela `admins` (a mesma usada pelo RLS)
 * e, se ADMIN_EMAIL estiver definido, o e-mail confere.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login"); // mostra as instruções de configuração
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const emailOk = !allowedEmail || user.email?.toLowerCase() === allowedEmail;

  if (!row || !emailOk) redirect("/admin/login?erro=sem-permissao");
  return { supabase, user };
}
