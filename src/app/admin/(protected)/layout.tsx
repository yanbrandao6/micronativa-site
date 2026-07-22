import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell email={admin.email} role={admin.role}>{children}</AdminShell>;
}
