import MenuExperience from "@/components/menu-experience";
import { getPublicMenu } from "@/lib/public-menu";

export const dynamic = "force-dynamic";

const categorySymbols = ["◉", "♨", "◌", "❋", "✦"];
const artColors = ["orange", "teal", "red"] as const;

export default async function Home() {
  const [settings, categories] = await getPublicMenu();

  const menuCategories = categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    symbol: categorySymbols[index % categorySymbols.length],
  }));
  const menuProducts = categories.flatMap((category, categoryIndex) => category.products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    discountPercent: product.discountPercent,
    categoryId: product.categoryId,
    categoryName: category.name,
    categorySymbol: categorySymbols[categoryIndex % categorySymbols.length],
    color: artColors[product.sortOrder % artColors.length],
    spicy: product.isSpicy,
    vegetarian: product.isVegetarian,
    available: product.isAvailable,
    imageUrl: product.imageUrl,
  })));

  return <MenuExperience categories={menuCategories} products={menuProducts} restaurantName={settings?.restaurantName} logoUrl={settings?.logoUrl} />;
}
