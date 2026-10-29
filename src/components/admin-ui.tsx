"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type CategoryRecord = { id: string; name: string; sortOrder: number; isActive: boolean; _count?: { products: number } };
type ProductRecord = {
  id: string; name: string; description: string | null; price: number; discountPercent: number | null;
  imageUrl: string | null; isAvailable: boolean; isSpicy: boolean; isVegetarian: boolean;
  sortOrder: number; categoryId: string; category?: { name: string };
};
type SettingsRecord = { restaurantName: string; logoUrl: string | null; phone: string | null; address: string | null };

async function requestJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "خطا در انجام درخواست");
  return result as T;
}

async function uploadImage(file: File) {
  const body = new FormData();
  body.set("file", file);
  const result = await requestJson<{ imageUrl: string }>("/api/admin/upload", "POST", body);
  return result.imageUrl;
}

export function AdminNav() {
  const router = useRouter();
  const logout = async () => {
    await requestJson("/api/admin/logout", "POST");
    router.replace("/admin/login");
    router.refresh();
  };
  return <nav className="admin-nav">
    <Link href="/admin/categories">دسته‌بندی‌ها</Link>
    <Link href="/admin/products">محصولات</Link>
    <Link href="/admin/settings">تنظیمات</Link>
    <Link href="/admin/change-password">تغییر رمز</Link>
    <button className="admin-button admin-button-quiet" type="button" onClick={logout}>خروج</button>
  </nav>;
}

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await requestJson("/api/admin/login", "POST", { username: form.get("username"), password: form.get("password") });
      router.replace("/admin/categories");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ورود انجام نشد");
    } finally { setBusy(false); }
  }
  return <form className="admin-form login-form" onSubmit={submit}>
    <div><label htmlFor="username">نام کاربری</label><input id="username" name="username" autoComplete="username" required /></div>
    <div><label htmlFor="password">رمز عبور</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
    {message && <p className="admin-message error" role="alert">{message}</p>}
    <button className="admin-button admin-button-primary" disabled={busy}>{busy ? "در حال ورود..." : "ورود به پنل"}</button>
  </form>;
}

export function CategoryManager({ initial }: { initial: CategoryRecord[] }) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const body = { name: form.get("name"), sortOrder: Number(form.get("sortOrder")), isActive: form.get("isActive") === "on" };
    try {
      const saved = await requestJson<CategoryRecord>(editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories", editing ? "PATCH" : "POST", body);
      setCategories((current) => editing ? current.map((item) => item.id === saved.id ? { ...item, ...saved } : item) : [...current, saved]);
      setEditing(null); formElement.reset(); setMessage("دسته‌بندی ذخیره شد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "ذخیره انجام نشد."); setError(true); }
    finally { setBusy(false); }
  }
  async function update(category: CategoryRecord, changes: Partial<CategoryRecord>) {
    try {
      const saved = await requestJson<CategoryRecord>(`/api/admin/categories/${category.id}`, "PATCH", { ...category, ...changes });
      setCategories((current) => current.map((item) => item.id === saved.id ? { ...item, ...saved } : item));
      setMessage("تغییرات ذخیره شد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "ذخیره انجام نشد."); setError(true); }
  }
  async function remove(category: CategoryRecord) {
    if (!window.confirm(`دسته‌بندی «${category.name}» و محصولات آن حذف شوند؟`)) return;
    try {
      await requestJson(`/api/admin/categories/${category.id}`, "DELETE");
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setMessage("دسته‌بندی حذف شد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "حذف انجام نشد."); setError(true); }
  }
  async function move(index: number, direction: -1 | 1) {
    const other = index + direction;
    if (other < 0 || other >= categories.length) return;
    const first = categories[index]; const second = categories[other];
    await Promise.all([update(first, { sortOrder: second.sortOrder }), update(second, { sortOrder: first.sortOrder })]);
  }
  return <div className="admin-grid">
    <form className="admin-form admin-panel" onSubmit={save}>
      <h2>{editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</h2>
      <div><label htmlFor="category-name">نام دسته‌بندی</label><input id="category-name" name="name" defaultValue={editing?.name ?? ""} required minLength={2} maxLength={80} /></div>
      <div><label htmlFor="category-sort">ترتیب نمایش</label><input id="category-sort" name="sortOrder" type="number" min="0" defaultValue={editing?.sortOrder ?? categories.length} /></div>
      <label className="admin-check"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive ?? true} /> نمایش در منوی عمومی</label>
      {message && <p className={`admin-message ${error ? "error" : ""}`} role="status">{message}</p>}
      <div className="admin-actions"><button className="admin-button admin-button-primary" disabled={busy}>{busy ? "در حال ذخیره..." : "ذخیره"}</button>{editing && <button className="admin-button" type="button" onClick={() => setEditing(null)}>انصراف</button>}</div>
    </form>
    <section className="admin-panel"><h2>دسته‌بندی‌ها <span className="admin-count">{categories.length}</span></h2>
      {categories.length === 0 ? <p className="admin-muted">هنوز دسته‌بندی‌ای ثبت نشده است.</p> : <div className="admin-list">{categories.map((category, index) => <div className="admin-list-row" key={category.id}>
        <div className="admin-row-main"><strong>{category.name}</strong><small>{category._count?.products ?? 0} محصول · {category.isActive ? "فعال" : "غیرفعال"}</small></div>
        <div className="admin-row-actions"><button className="admin-icon-button" aria-label="جابجایی به بالا" title="جابجایی به بالا" disabled={index === 0} onClick={() => move(index, -1)}>↑</button><button className="admin-icon-button" aria-label="جابجایی به پایین" title="جابجایی به پایین" disabled={index === categories.length - 1} onClick={() => move(index, 1)}>↓</button><button className="admin-button" onClick={() => setEditing(category)}>ویرایش</button><button className="admin-button admin-button-danger" onClick={() => remove(category)}>حذف</button></div>
      </div>)}</div>}
    </section>
  </div>;
}

const emptyProduct: { name: string; description: string; price: number; discountPercent: string; imageUrl: string; isAvailable: boolean; isSpicy: boolean; isVegetarian: boolean; sortOrder: number; categoryId: string } = { name: "", description: "", price: 0, discountPercent: "", imageUrl: "", isAvailable: true, isSpicy: false, isVegetarian: false, sortOrder: 0, categoryId: "" };

export function ProductManager({ initial, categories }: { initial: ProductRecord[]; categories: CategoryRecord[] }) {
  const [products, setProducts] = useState(initial);
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const startEdit = (product: ProductRecord) => {
    setEditing(product);
    setForm({ name: product.name, description: product.description ?? "", price: product.price, discountPercent: product.discountPercent?.toString() ?? "", imageUrl: product.imageUrl ?? "", isAvailable: product.isAvailable, isSpicy: product.isSpicy, isVegetarian: product.isVegetarian, sortOrder: product.sortOrder, categoryId: product.categoryId });
  };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const payload = {
      ...form,
      price: Number(form.price),
      discountPercent: form.discountPercent === "" ? undefined : Number(form.discountPercent),
      sortOrder: editing ? Number(form.sortOrder) : products.filter((product) => product.categoryId === form.categoryId).length,
    };
    try {
      const saved = await requestJson<ProductRecord>(editing ? `/api/admin/products/${editing.id}` : "/api/admin/products", editing ? "PATCH" : "POST", payload);
      setProducts((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setEditing(null); setForm({ ...emptyProduct, categoryId: categories[0]?.id ?? "" }); setMessage("محصول ذخیره شد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "ذخیره انجام نشد."); setError(true); }
    finally { setBusy(false); }
  }
  async function toggleAvailability(product: ProductRecord) {
    const payload = { ...product, description: product.description ?? "", discountPercent: product.discountPercent ?? undefined, imageUrl: product.imageUrl ?? "", isAvailable: !product.isAvailable, categoryId: product.categoryId };
    try {
      const saved = await requestJson<ProductRecord>(`/api/admin/products/${product.id}`, "PATCH", payload);
      setProducts((current) => current.map((item) => item.id === saved.id ? { ...item, ...saved } : item));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "تغییر وضعیت انجام نشد."); setError(true); }
  }
  async function moveProduct(product: ProductRecord, direction: -1 | 1) {
    const group = products.filter((item) => item.categoryId === product.categoryId).sort((a, b) => a.sortOrder - b.sortOrder);
    const index = group.findIndex((item) => item.id === product.id);
    const target = index + direction;
    if (target < 0 || target >= group.length) return;
    [group[index], group[target]] = [group[target], group[index]];
    const updates = group.map((item, sortOrder) => requestJson<ProductRecord>(`/api/admin/products/${item.id}`, "PATCH", {
      name: item.name, description: item.description ?? "", price: item.price, discountPercent: item.discountPercent ?? undefined,
      imageUrl: item.imageUrl ?? "", isAvailable: item.isAvailable, isSpicy: item.isSpicy,
      isVegetarian: item.isVegetarian, sortOrder, categoryId: item.categoryId,
    }));
    try {
      const saved = await Promise.all(updates);
      setProducts((current) => current.map((item) => {
        const updated = saved.find((result) => result.id === item.id);
        return updated ? { ...item, ...updated, category: item.category } : item;
      }));
      setMessage("ترتیب محصولات ذخیره شد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "تغییر ترتیب انجام نشد."); setError(true); }
  }
  async function remove(product: ProductRecord) {
    if (!window.confirm(`محصول «${product.name}» حذف شود؟`)) return;
    try {
      await requestJson(`/api/admin/products/${product.id}`, "DELETE");
      setProducts((current) => current.filter((item) => item.id !== product.id)); setMessage("محصول حذف شد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "حذف انجام نشد."); setError(true); }
  }
  async function changeImage(file?: File) {
    if (!file) return;
    setBusy(true);
    try { const imageUrl = await uploadImage(file); setForm((current) => ({ ...current, imageUrl })); setMessage("تصویر بارگذاری شد."); setError(false); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "بارگذاری تصویر انجام نشد."); setError(true); }
    finally { setBusy(false); }
  }
  return <div className="admin-grid product-admin-grid">
    <form className="admin-form admin-panel" onSubmit={save}>
      <h2>{editing ? "ویرایش محصول" : "محصول جدید"}</h2>
      <div><label htmlFor="product-name">نام محصول</label><input id="product-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} maxLength={100} /></div>
      <div><label htmlFor="product-category">دسته‌بندی</label><select id="product-category" value={form.categoryId || categories[0]?.id || ""} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></div>
      <div className="admin-field-row"><div><label htmlFor="product-price">قیمت (تومان)</label><input id="product-price" type="number" min="1" value={form.price || ""} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required /></div><div><label htmlFor="product-discount">تخفیف (٪)</label><input id="product-discount" type="number" min="0" max="100" value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} /></div></div>
      <div><label htmlFor="product-description">توضیحات</label><textarea id="product-description" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} /></div>
      <div><label htmlFor="product-image">تصویر محصول</label><input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void changeImage(event.target.files?.[0])} />{form.imageUrl && <span className="admin-muted">تصویر انتخاب شده است.</span>}</div>
      <label className="admin-check"><input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} /> موجود است</label>
      <div className="admin-field-row"><label className="admin-check"><input type="checkbox" checked={form.isSpicy} onChange={(event) => setForm({ ...form, isSpicy: event.target.checked })} /> تند</label><label className="admin-check"><input type="checkbox" checked={form.isVegetarian} onChange={(event) => setForm({ ...form, isVegetarian: event.target.checked })} /> گیاهی</label></div>
      {message && <p className={`admin-message ${error ? "error" : ""}`} role="status">{message}</p>}
      <div className="admin-actions"><button className="admin-button admin-button-primary" disabled={busy || categories.length === 0}>{busy ? "در حال ذخیره..." : "ذخیره محصول"}</button>{editing && <button className="admin-button" type="button" onClick={() => { setEditing(null); setForm({ ...emptyProduct, categoryId: categories[0]?.id ?? "" }); }}>انصراف</button>}</div>
    </form>
    <section className="admin-panel"><h2>محصولات <span className="admin-count">{products.length}</span></h2>{products.length === 0 ? <p className="admin-muted">هنوز محصولی ثبت نشده است.</p> : <div className="admin-list">{products.map((product) => <div className="admin-list-row" key={product.id}>
      <div className="admin-row-main"><strong>{product.name}</strong><small>{product.category?.name ?? "بدون دسته‌بندی"} · {new Intl.NumberFormat("fa-IR").format(product.price)} تومان · {product.isAvailable ? "موجود" : "ناموجود"}</small></div>
      <div className="admin-row-actions"><button className="admin-icon-button" aria-label="جابجایی به بالا" title="جابجایی به بالا" onClick={() => void moveProduct(product, -1)}>↑</button><button className="admin-icon-button" aria-label="جابجایی به پایین" title="جابجایی به پایین" onClick={() => void moveProduct(product, 1)}>↓</button><button className={`admin-button ${product.isAvailable ? "" : "admin-button-primary"}`} onClick={() => void toggleAvailability(product)}>{product.isAvailable ? "ناموجود" : "موجود"}</button><button className="admin-button" onClick={() => startEdit(product)}>ویرایش</button><button className="admin-button admin-button-danger" onClick={() => void remove(product)}>حذف</button></div>
    </div>)}</div>}</section>
  </div>;
}

export function SettingsForm({ initial }: { initial: SettingsRecord }) {
  const [settings, setSettings] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try { const logoUrl = await uploadImage(file); setSettings((current) => ({ ...current, logoUrl })); setMessage("لوگو بارگذاری شد."); setError(false); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "بارگذاری انجام نشد."); setError(true); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const saved = await requestJson<SettingsRecord>("/api/admin/settings", "PUT", {
        ...settings,
        logoUrl: settings.logoUrl ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
      });
      setSettings(saved); setMessage("تنظیمات ذخیره شد."); setError(false);
    }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "ذخیره انجام نشد."); setError(true); }
    finally { setBusy(false); }
  }
  return <form className="admin-form admin-panel settings-form" onSubmit={save}>
    <div><label htmlFor="restaurant-name">نام رستوران</label><input id="restaurant-name" value={settings.restaurantName} onChange={(event) => setSettings({ ...settings, restaurantName: event.target.value })} required minLength={2} maxLength={100} /></div>
    <div><label htmlFor="restaurant-logo">لوگو</label><input id="restaurant-logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0])} />{settings.logoUrl && <span className="admin-muted">لوگوی فعلی: {settings.logoUrl}</span>}</div>
    <div><label htmlFor="restaurant-phone">تلفن</label><input id="restaurant-phone" value={settings.phone ?? ""} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} maxLength={32} /></div>
    <div><label htmlFor="restaurant-address">نشانی</label><textarea id="restaurant-address" rows={3} value={settings.address ?? ""} onChange={(event) => setSettings({ ...settings, address: event.target.value })} maxLength={300} /></div>
    {message && <p className={`admin-message ${error ? "error" : ""}`} role="status">{message}</p>}
    <button className="admin-button admin-button-primary" disabled={busy}>{busy ? "در حال ذخیره..." : "ذخیره تنظیمات"}</button>
  </form>;
}

export function ChangePasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await requestJson("/api/admin/password", "POST", { currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") });
      formElement.reset(); setMessage("رمز عبور تغییر کرد."); setError(false);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "تغییر رمز انجام نشد."); setError(true); }
    finally { setBusy(false); }
  }
  return <form className="admin-form admin-panel password-form" onSubmit={save}>
    <div><label htmlFor="current-password">رمز عبور فعلی</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" minLength={8} required /></div>
    <div><label htmlFor="new-password">رمز عبور جدید</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} required /><small className="admin-muted">حداقل ۱۲ نویسه</small></div>
    {message && <p className={`admin-message ${error ? "error" : ""}`} role="status">{message}</p>}
    <button className="admin-button admin-button-primary" disabled={busy}>{busy ? "در حال ذخیره..." : "تغییر رمز عبور"}</button>
  </form>;
}