import { SettingsForm } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return <section><div className="admin-page-heading"><div><p className="admin-kicker">اطلاعات عمومی</p><h2>تنظیمات رستوران</h2></div></div><SettingsForm initial={settings ?? { restaurantName: "رستوران نارنج", logoUrl: null, phone: null, address: null }} /></section>;
}