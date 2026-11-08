import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ivory font-sans text-ink">{isSupabaseConfigured ? children : <SetupNotice />}</div>
  );
}
