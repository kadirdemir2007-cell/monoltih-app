import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // YENİ EKLEDİĞİMİZ FONKSİYON
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      // Eğer ürün sepette 1 taneyse, ürünü sepetten tamamen çıkar
      if (existingItem.quantity === 1) {
        return prevItems.filter(item => item.id !== productId);
      } else {
        // Eğer 1'den fazlaysa, miktarını 1 azalt
        return prevItems.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart, // Yeni fonksiyonu paylaşıma açıyoruz
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
