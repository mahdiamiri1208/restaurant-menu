import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell" dir="rtl">
    <header className="admin-header"><div><p className="admin-kicker">مدیریت رستوران</p><h1>منوی رستوران</h1></div><span className="admin-user">{admin.username}</span></header>
    <AdminNav />
    <main className="admin-main">{children}</main>
  </div>;
}