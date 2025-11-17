import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
// Kalp ikonlarını import ediyoruz (Dolu ve Boş)
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmalısınız.');
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
        setError('Ürünler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [navigate]);

  // Favori Ekleme/Çıkarma Fonksiyonu
  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`http://localhost:5000/api/products/${product.id}/favorite`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Backend'den gelen cevaba göre UI'daki kalbi güncelle
        const isFav = response.data.is_favorite;
        
        // State'i güncelle (Sayfa yenilenmeden kalp değişsin)
        setProducts(products.map(p => 
            p.id === product.id ? { ...p, is_favorite: isFav } : p
        ));

        if (isFav) toast.success('Favorilere eklendi ❤️');
        else toast.info('Favorilerden çıkarıldı 💔');

    } catch (err) {
        toast.error('İşlem başarısız.');
    }
  };

  const categories = ['Tümü', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="container mt-5 text-center"><p>Yükleniyor...</p></div>;
  if (error) return <div className="container mt-5 text-center"><p className="text-danger">{error}</p></div>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Ürünler</h1>

      {/* Filtre ve Arama */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Ürün ara..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="col-md-6 mt-2 mt-md-0">
          <div className="btn-group" role="group">
            {categories.map(cat => (
              <button key={cat} type="button" 
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="row">
        {filteredProducts.map(product => (
          <div className="col-md-4 mb-4" key={product.id}>
            <div className="card h-100 position-relative">
                {/* FAVORİ KALBİ */}
                <span 
                    className="position-absolute top-0 end-0 m-3" 
                    style={{ cursor: 'pointer', fontSize: '1.5rem', zIndex: 10, color: 'red' }}
                    onClick={() => toggleFavorite(product)}
                >
                    {product.is_favorite ? <FaHeart /> : <FaRegHeart />}
                </span>

                <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-secondary">{product.category}</span>
                </div>
              
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={product.image_url} className="card-img-top" alt={product.name} style={{ height: '200px', objectFit: 'contain', padding: '10px' }} />
                <div className="card-body"> 
                  <h5 className="card-title">{product.name}</h5>
                </div>
              </Link>
              
              <div className="card-body d-flex flex-column pt-0"> 
                <p className="card-text fs-5 fw-bold">{product.price.toFixed(2)} TL</p>
                {product.stock > 0 ? <p className="text-success small">Stokta: {product.stock} adet</p> : <p className="text-danger small fw-bold">Stok Tükendi</p>}

                <button className="btn btn-primary mt-auto" disabled={product.stock === 0}
                  onClick={() => { addToCart(product); toast.success(`${product.name} sepete eklendi!`); }}>
                  {product.stock > 0 ? "Sepete Ekle" : "Tükendi"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
