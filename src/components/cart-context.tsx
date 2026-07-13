"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartLine } from "@/lib/types";

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: CartLine) => void;
  removeLine: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "amber-hour-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Partial<CartLine>[];

    return parsed.map((line) => ({
      productId: line.productId ?? "",
      variantId: line.variantId ?? "default",
      productName: line.productName ?? "Product",
      unitPriceDisplay: line.unitPriceDisplay ?? "$0.00",
      quantity: line.quantity ?? 1,
    }));
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((count, line) => count + line.quantity, 0);

    return {
      lines,
      isOpen,
      itemCount,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      clearCart: () => setLines([]),
      addLine: (line) => {
        setLines((current) => {
          const existing = current.find(
            (currentLine) =>
              currentLine.productId === line.productId && currentLine.variantId === line.variantId,
          );

          if (!existing) {
            return [...current, line];
          }

          return current.map((currentLine) => {
            if (
              currentLine.productId === line.productId &&
              currentLine.variantId === line.variantId
            ) {
              return { ...currentLine, quantity: currentLine.quantity + line.quantity };
            }

            return currentLine;
          });
        });
        setIsOpen(true);
      },
      removeLine: (productId, variantId) => {
        setLines((current) =>
          current.filter(
            (line) => !(line.productId === productId && line.variantId === variantId),
          ),
        );
      },
      updateQuantity: (productId, variantId, quantity) => {
        setLines((current) =>
          current
            .map((line) => {
              if (line.productId === productId && line.variantId === variantId) {
                return { ...line, quantity };
              }

              return line;
            })
            .filter((line) => line.quantity > 0),
        );
      },
    };
  }, [isOpen, lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return ctx;
}
