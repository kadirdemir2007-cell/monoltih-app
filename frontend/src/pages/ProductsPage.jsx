import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bu sayfayı görüntülemek için giriş yapmalısınız.');
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/products/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProducts(response.data);
      } catch (err) {
        setError('Ürünler yüklenemedi. Token geçersiz veya süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [navigate]);

  if (loading) {
    return <div className="container mt-5 text-center"><p>Ürünler Yükleniyor...</p></div>;
  }

  if (error) {
    return <div className="container mt-5 text-center"><p className="text-danger">{error}</p></div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Ürünler</h1>
      <div className="row">
        {products.map(product => ( // <-- map burada başlıyor
          <div className="col-md-4 mb-4" key={product.id}>
            <div className="card h-100">
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img 
  src={product.image_url} 
  className="card-img-top" 
  alt={product.name} 
  style={{ height: '200px', objectFit: 'contain', padding: '10px' }} 
/>
                <div className="card-body"> 
                  <h5 className="card-title">{product.name}</h5>
                </div>
              </Link>
              <div className="card-body d-flex flex-column pt-0"> 
                <p className="card-text">{product.price.toFixed(2)} TL</p>
                <button className="btn btn-primary mt-auto" onClick={() => {
                  addToCart(product);
                  toast.success(`${product.name} sepete eklendi!`);
                }}>
                  Sepete Ekle
                </button>
              </div>
            </div> {/* <-- card h-100 div'i burada bitiyor */}
          </div> // <-- col-md-4 div'i burada bitiyor
        ))} {/* <-- map fonksiyonunun callback'i burada bitiyor */}
      </div> {/* <-- row div'i burada bitiyor */}
    </div> // <-- container div'i burada bitiyor
  );
}

export default ProductsPage;
