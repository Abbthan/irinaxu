import type { Metadata } from "next";
import { AdminEditor } from "@/components/admin-editor";

export const metadata: Metadata = {
  title: "Website studio — Irina",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return <AdminEditor />;
}
