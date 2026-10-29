export function formatToman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function discountedPrice(price: number, discountPercent?: number | null) {
  return discountPercent ? Math.round(price * (100 - discountPercent) / 100) : price;
}