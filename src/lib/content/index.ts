import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient, createSessionClient } from "@/lib/supabase/server";
import type { ExperienceData } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";
import { getLocalExperience } from "./local";
import { getSupabaseExperience } from "./supabase";

/** Experiência pública: apenas conteúdo publicado. */
export async function getPublicExperience(): Promise<ExperienceData> {
  if (!isSupabaseConfigured) return getLocalExperience(false);
  return getSupabaseExperience(createPublicClient(), false);
}

/** Pré-visualização do admin: inclui rascunhos (o RLS confirma que é um admin). */
export async function getPreviewExperience(): Promise<ExperienceData> {
  if (!isSupabaseConfigured) return getLocalExperience(true);
  return getSupabaseExperience(await createSessionClient(), true);
}

/**
 * Dados do painel. Verifica o administrador antes de qualquer leitura — layouts e
 * páginas do Next são renderizados em paralelo, então cada página se protege sozinha.
 */
export async function getAdminExperience(): Promise<ExperienceData> {
  await requireAdmin();
  return getPreviewExperience();
}
