import { Experience } from "@/components/experience/Experience";
import { getExperience } from "@/lib/content";

export default function Home() {
  return <Experience data={getExperience()} />;
}
