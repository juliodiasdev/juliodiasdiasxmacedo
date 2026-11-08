import { getAdminExperience } from "@/lib/content";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function TextsPage() {
  const { settings } = await getAdminExperience();
  return (
    <div>
      <h1 className="font-serif text-4xl">Textos e capítulos</h1>
      <p className="mt-2 text-sm text-ink/60">Frases de abertura, títulos, ordem dos capítulos, trilha sonora e vídeos entre capítulos.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
