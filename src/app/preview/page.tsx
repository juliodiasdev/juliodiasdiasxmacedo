import type { Metadata } from "next";
import { Experience } from "@/components/experience/Experience";
import { requireAdmin } from "@/lib/auth";
import { getPreviewExperience } from "@/lib/content";

export const metadata: Metadata = { title: "Pré-visualização", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Mostra a experiência exatamente como ela verá, incluindo rascunhos (marcados). */
export default async function Preview() {
  await requireAdmin();
  const data = await getPreviewExperience();
  return <Experience data={data} preview />;
}
