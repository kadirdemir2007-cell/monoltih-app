import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }

      try {
        const response = await axios.get('http://localhost:5000/api/products/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFavorites(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavorites();
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Favorilerim ❤️</h2>
      {favorites.length === 0 ? (
        <div className="alert alert-warning">Henüz favori ürününüz yok.</div>
      ) : (
        <div className="row">
          {favorites.map(product => (
            <div className="col-md-3 mb-4" key={product.id}>
              <div className="card h-100">
                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img src={product.image_url} className="card-img-top" alt={product.name} style={{ height: '150px', objectFit: 'contain', padding: '10px' }} />
                    <div className="card-body text-center">
                    <h6 className="card-title">{product.name}</h6>
                    <p className="card-text text-primary fw-bold">{product.price.toFixed(2)} TL</p>
                    </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
