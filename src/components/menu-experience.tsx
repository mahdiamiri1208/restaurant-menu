"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Category = { id: string; name: string; symbol: string };
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent?: number | null;
  categoryId: string;
  categoryName: string;
  categorySymbol: string;
  color: "orange" | "teal" | "red";
  spicy: boolean;
  vegetarian: boolean;
  available: boolean;
  imageUrl?: string | null;
};

const demoCategories: Category[] = [
  { id: "all", name: "همه", symbol: "✦" },
  { id: "starters", name: "پیش‌غذا", symbol: "◉" },
  { id: "main", name: "غذای اصلی", symbol: "♨" },
  { id: "drinks", name: "نوشیدنی", symbol: "◌" },
  { id: "dessert", name: "دسر", symbol: "❋" },
];

const demoProducts: Product[] = [
  { id: "1", name: "سالاد سزار", description: "کاهوی تازه، مرغ گریل، نان کروتان و سس مخصوص", price: 285000, categoryId: "starters", categoryName: "پیش‌غذا", categorySymbol: "◉", color: "teal", spicy: false, vegetarian: false, available: true },
  { id: "2", name: "سوپ روز", description: "سوپ گرم و تازه با سبزیجات فصل", price: 165000, categoryId: "starters", categoryName: "پیش‌غذا", categorySymbol: "◉", color: "orange", spicy: false, vegetarian: true, available: true },
  { id: "3", name: "چلو کباب لقمه", description: "دو سیخ کباب دست‌ساز، برنج ایرانی و گوجه کبابی", price: 495000, categoryId: "main", categoryName: "غذای اصلی", categorySymbol: "♨", color: "red", spicy: true, vegetarian: false, available: true },
  { id: "4", name: "پاستا آلفردو", description: "مرغ گریل، قارچ تازه و سس آلفردوی خامه‌ای", price: 385000, discountPercent: 15, categoryId: "main", categoryName: "غذای اصلی", categorySymbol: "♨", color: "orange", spicy: false, vegetarian: false, available: true },
  { id: "5", name: "برگر گیاهی", description: "برگر سبزیجات، پنیر چدار و سس خانگی", price: 340000, categoryId: "main", categoryName: "غذای اصلی", categorySymbol: "♨", color: "teal", spicy: false, vegetarian: true, available: false },
  { id: "6", name: "لیموناد نعنا", description: "آب‌لیموی تازه، نعنا و یخ", price: 115000, categoryId: "drinks", categoryName: "نوشیدنی", categorySymbol: "◌", color: "teal", spicy: false, vegetarian: true, available: true },
  { id: "7", name: "چیزکیک زعفرانی", description: "چیزکیک لطیف با عطر زعفران ایرانی", price: 195000, categoryId: "dessert", categoryName: "دسر", categorySymbol: "❋", color: "red", spicy: false, vegetarian: true, available: true },
];

function Icon({ name, size = 20 }: { name: "search" | "close" | "flame" | "leaf" | "bell" | "plate"; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "search") return <svg {...props}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
  if (name === "close") return <svg {...props}><path d="m18 6-12 12M6 6l12 12" /></svg>;
  if (name === "flame") return <svg {...props}><path d="M12 22c4.2 0 7-2.9 7-6.7 0-3.1-1.6-5.2-4.1-7.8-.1 2.4-1.2 3.7-2.1 4.1C12.8 7.4 10.1 4.6 7 2c.4 4.7-2 7.3-2 12.2C5 18.4 7.9 22 12 22Z" /></svg>;
  if (name === "leaf") return <svg {...props}><path d="M20.5 3.5C12 3.5 5 5.2 5 12.1c0 3 2 5.2 4.8 5.2 6.8 0 9.5-6.4 10.7-13.8Z" /><path d="M3.5 21c3-5.3 6.6-8.5 11.6-11.4" /></svg>;
  if (name === "bell") return <svg {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg>;
  return <svg {...props}><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" /><path d="m4.5 8.8 7.5 4.3 7.5-4.3M12 13v7" /></svg>;
}

function toman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export default function MenuExperience({
  categories: categoryData = demoCategories,
  products = demoProducts,
  restaurantName = "رستوران نارنج",
  logoUrl,
}: {
  categories?: Category[];
  products?: Product[];
  restaurantName?: string;
  logoUrl?: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const categories = [{ id: "all", name: "همه", symbol: "✦" }, ...categoryData];
  const visibleProducts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fa");
    return products.filter((product) => !search || product.name.toLocaleLowerCase("fa").includes(search));
  }, [products, query]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-category]");
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveCategory(current.target.getAttribute("data-category") ?? "all");
    }, { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    setActiveCategory(id);
    if (id === "all") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shownCategories = categories.slice(1).filter((category) => visibleProducts.some((product) => product.categoryId === category.id));

  return (
    <main className="menu-shell">
      <div className="ambient ambient-orange" /><div className="ambient ambient-teal" /><div className="ambient ambient-red" />
      <div className="menu-content">
        <header className="menu-header">
          <div className="restaurant-mark">{logoUrl ? <Image src={logoUrl} alt="" fill sizes="48px" /> : <Icon name="plate" size={24} />}</div>
          <div className="restaurant-copy"><p className="eyebrow">طعم خوب، حال خوب</p><h1>{restaurantName}</h1></div>
          <button className="icon-button search-toggle" type="button" aria-label={searchOpen ? "بستن جستجو" : "جستجو در منو"} onClick={() => { setSearchOpen((open) => !open); setQuery(""); }}><Icon name={searchOpen ? "close" : "search"} /></button>
        </header>
        <div className={`search-field ${searchOpen ? "search-field-open" : ""}`}><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو در منو..." aria-label="جستجو در منو" tabIndex={searchOpen ? 0 : -1} /></div>
        <nav className="category-rail" aria-label="دسته‌بندی منو">
          {categories.map((category) => <button key={category.id} type="button" className={`category-chip ${activeCategory === category.id ? "active" : ""}`} aria-pressed={activeCategory === category.id} onClick={() => jumpTo(category.id)}><span className="category-symbol" aria-hidden="true">{category.symbol}</span>{category.name}</button>)}
        </nav>
        <section className="menu-intro" data-category="all"><p>منوی امروز</p><span>با عشق آماده شده برای شما</span></section>
        <div className="menu-sections">
          {shownCategories.map((category) => {
            const items = visibleProducts.filter((product) => product.categoryId === category.id);
            return <section className="menu-section" id={`section-${category.id}`} data-category={category.id} key={category.id}>
              <div className="section-heading"><span className="section-icon" aria-hidden="true">{category.symbol}</span><h2>{category.name}</h2><span className="section-count">{toman(items.length)} مورد</span></div>
              <div className="product-list">{items.map((product) => {
                const finalPrice = product.discountPercent ? Math.round(product.price * (100 - product.discountPercent) / 100) : product.price;
                return <article key={product.id} className={`product-card ${product.available ? "" : "product-unavailable"}`}>
                  <div className={`product-art art-${product.color}`} aria-hidden="true">{product.imageUrl ? <Image src={product.imageUrl} alt="" fill sizes="(max-width: 380px) 90px, 112px" loading="lazy" /> : <span className="product-placeholder-icon">{product.categorySymbol}</span>}<span className="art-glint" /></div>
                  <div className="product-info"><div className="product-title-line"><h3>{product.name}</h3>{product.discountPercent ? <span className="discount-badge">٪{toman(product.discountPercent)}</span> : null}</div>
                    <p className="product-description">{product.description}</p><div className="product-bottom"><div className="product-tags">{product.spicy && <span className="food-tag spicy"><Icon name="flame" size={14} /> تند</span>}{product.vegetarian && <span className="food-tag vegetarian"><Icon name="leaf" size={14} /> گیاهی</span>}{!product.available && <span className="unavailable-label">ناموجود</span>}</div>
                      <div className="product-price">{product.discountPercent ? <span className="old-price">{toman(product.price)}</span> : null}<strong>{toman(finalPrice)} <small>تومان</small></strong></div></div></div>
                </article>;
              })}</div>
            </section>;
          })}
          {visibleProducts.length === 0 && <p className="empty-results">موردی با این نام پیدا نشد.</p>}
        </div>
        <footer className="menu-footer">مواد اولیه تازه، هر روز در نارنج</footer>
      </div>
      <aside className="waiter-bar"><span className="bell-disc"><Icon name="bell" size={19} /></span><span>سفارش خود را به گارسون اعلام کنید</span><span className="waiter-dot" /></aside>
    </main>
  );
}