/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react"; // Adicionei useEffect
import type { ReactNode } from "react";
import type { Coffee } from "../types";
import toast from "react-hot-toast";

export interface CartItem extends Coffee {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartQuantity: number;
  addCoffeeToCart: (coffee: Coffee) => void;
  removeCoffeeFromCart: (coffeeId: string) => void;
  deleteCoffeeFromCart: (coffeeId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCartItems = localStorage.getItem("kauasCaffe:cartItems");
    if (storedCartItems) {
      return JSON.parse(storedCartItems);
    }
    return [];
  });

  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  useEffect(() => {
    localStorage.setItem("kauasCaffe:cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  function addCoffeeToCart(coffee: Coffee) {
    const coffeeIndex = cartItems.findIndex((item) => item.id === coffee.id);
    const newCart = [...cartItems];

    if (coffeeIndex >= 0) {
      if (newCart[coffeeIndex].quantity >= coffee.stock) {
        // 2. Trocamos o alert() pelo toast.error()
        toast.error(
          `Temos apenas ${coffee.stock} unidades de ${coffee.name}!`,
          {
            style: {
              background: "#fffbeb", // Fundo amarelinho
              color: "#78350f", // Texto marrom escuro
              border: "1px solid #fcd34d",
            },
            iconTheme: {
              primary: "#d97706",
              secondary: "#fffbeb",
            },
          },
        );
        return;
      }
      newCart[coffeeIndex].quantity += 1;
    } else {
      if (coffee.stock <= 0) return;
      newCart.push({ ...coffee, quantity: 1 });
      // Notificação de sucesso ao adicionar um café novo
      toast.success(`${coffee.name} adicionado!`, {
        style: { background: "#f5f5f4", color: "#1c1917" },
      });
    }

    setCartItems(newCart);
  }

  function removeCoffeeFromCart(coffeeId: string) {
    const newCart = [...cartItems];
    const coffeeIndex = newCart.findIndex((item) => item.id === coffeeId);

    if (coffeeIndex >= 0) {
      if (newCart[coffeeIndex].quantity > 1) {
        newCart[coffeeIndex].quantity -= 1;
        setCartItems(newCart);
      } else {
        deleteCoffeeFromCart(coffeeId);
      }
    }
  }

  function deleteCoffeeFromCart(coffeeId: string) {
    const newCart = cartItems.filter((item) => item.id !== coffeeId);
    setCartItems(newCart);
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartQuantity,
        addCoffeeToCart,
        removeCoffeeFromCart,
        deleteCoffeeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
