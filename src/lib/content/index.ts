import "server-only";
import type { ExperienceData } from "@/lib/types";
import { getLocalExperience } from "./local";

/**
 * Todo o conteúdo vem dos arquivos em /content — sem banco de dados.
 * Apenas itens com "status": "published" aparecem no site.
 */
export function getExperience(): ExperienceData {
  return getLocalExperience(false);
}
