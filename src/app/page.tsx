import { Experience } from "@/components/experience/Experience";
import { getPublicExperience } from "@/lib/content";

// Novos pensamentos aparecem sem novo deploy: o painel revalida esta página ao salvar.
export const revalidate = 300;

export default async function Home() {
  const data = await getPublicExperience();
  return <Experience data={data} />;
}
