// Cart utility helpers
export const calcTotal = (items) =>
  items.reduce((sum, x) => sum + x.price * x.quantity, 0);

export const calcShipping = (total) => (total > 100 ? 0 : 15);

export const formatPrice = (num) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num ?? 0);
