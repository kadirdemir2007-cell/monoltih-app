import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext'; // Burayı ekledik

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartProvider> {/* Burayı ekledik */}
      <App />
    </CartProvider> {/* Burayı ekledik */}
  </React.StrictMode>
);
