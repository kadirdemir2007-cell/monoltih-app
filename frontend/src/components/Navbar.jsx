import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    navigate('/payment');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to={token ? "/products" : "/"}>Alışveriş Sitesi</Link>
        
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {token ? (
              <>
                {/* Favorilerim Linki */}
                <li className="nav-item">
                  <Link className="nav-link" to="/favorites">Favorilerim</Link>
                </li>

                {/* Sepet Linki */}
                <li className="nav-item">
                  <a className="nav-link" href="/payment" onClick={handleCartClick}>
                    Sepet ({itemCount})
                  </a>
                </li>

                {/* Profilim Linki */}
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profilim</Link>
                </li>

                {/* Çıkış Yap Butonu */}
                <li className="nav-item">
                  <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
                    Çıkış Yap
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Giriş Yap</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Kayıt Ol</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
