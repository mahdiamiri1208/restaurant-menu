import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin-ui";

export const metadata: Metadata = { title: "ورود مدیر | منوی رستوران" };

export default function AdminLoginPage() {
  return <main className="admin-login-shell" dir="rtl">
    <div className="admin-login-panel">
      <Link className="admin-back-link" href="/">بازگشت به منوی عمومی</Link>
      <p className="admin-kicker">پنل مدیریت</p>
      <h1>ورود مدیر</h1>
      <p className="admin-muted">برای مدیریت منو وارد شوید.</p>
      <LoginForm />
    </div>
  </main>;
}