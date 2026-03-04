import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persist = (next) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const addItem = (item) => {
    // item: { productId, name, image, variantSku, price, quantity }
    const next = [...items];
    const idx = next.findIndex(
      (x) => x.productId === item.productId && x.variantSku === item.variantSku
    );
    if (idx >= 0) next[idx].quantity += item.quantity;
    else next.push(item);
    persist(next);
  };

  const updateQty = (productId, variantSku, quantity) => {
    const next = items
      .map((x) =>
        x.productId === productId && x.variantSku === variantSku
          ? { ...x, quantity }
          : x
      )
      .filter((x) => x.quantity > 0);
    persist(next);
  };

  const removeItem = (productId, variantSku) => {
    persist(items.filter((x) => !(x.productId === productId && x.variantSku === variantSku)));
  };

  const clear = () => persist([]);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + x.price * x.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}
