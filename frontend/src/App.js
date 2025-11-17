import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
// EKSİK OLAN SATIR BUYDU:
import AdminOrdersPage from "./pages/AdminOrdersPage"; 

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <Navbar />
        
        <div className="container flex-grow-1">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route path="/admin" element={<AdminPage />} />
            {/* Sipariş Yönetimi Rotası */}
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
