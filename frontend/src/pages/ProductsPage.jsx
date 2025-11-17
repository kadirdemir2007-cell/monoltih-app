import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtreleme ve Sıralama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [sortType, setSortType] = useState('default'); // YENİ: Sıralama durumu

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

  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`http://localhost:5000/api/products/${product.id}/favorite`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const isFav = response.data.is_favorite;
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

  // 1. Önce Filtrele
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 2. Sonra Sırala (YENİ KISIM)
  filteredProducts.sort((a, b) => {
    if (sortType === 'price-asc') {
        return a.price - b.price; // Fiyat Artan
    } else if (sortType === 'price-desc') {
        return b.price - a.price; // Fiyat Azalan
    } else if (sortType === 'name-asc') {
        return a.name.localeCompare(b.name); // İsim A-Z
    } else if (sortType === 'name-desc') {
        return b.name.localeCompare(a.name); // İsim Z-A
    }
    return 0; // Varsayılan sıralama
  });

  if (loading) return <div className="container mt-5 text-center"><p>Yükleniyor...</p></div>;
  if (error) return <div className="container mt-5 text-center"><p className="text-danger">{error}</p></div>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Ürünler</h1>

      {/* Filtre, Arama ve Sıralama Alanı */}
      <div className="row mb-4 g-3">
        {/* Arama */}
        <div className="col-md-4">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ürün ara..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* Kategori Butonları */}
        <div className="col-md-5">
          <div className="btn-group flex-wrap" role="group">
            {categories.map(cat => (
              <button key={cat} type="button" 
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Sıralama Dropdown (YENİ) */}
        <div className="col-md-3">
            <select 
                className="form-select" 
                value={sortType} 
                onChange={(e) => setSortType(e.target.value)}
            >
                <option value="default">Önerilen Sıralama</option>
                <option value="price-asc">En Düşük Fiyat</option>
                <option value="price-desc">En Yüksek Fiyat</option>
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
            </select>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="row">
        {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
            <div className="col-md-4 mb-4" key={product.id}>
                <div className="card h-100 position-relative">
                    {/* Favori İkonu */}
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
                    <p className="card-text fs-5 fw-bold">{product.price.toFixed(2)} TL</p>
                    {product.stock > 0 ? <p className="text-success small">Stokta: {product.stock} adet</p> : <p className="text-danger small fw-bold">Stok Tükendi</p>}

                    <button className="btn btn-primary mt-auto" disabled={product.stock === 0}
                    onClick={() => { addToCart(product); toast.success(`${product.name} sepete eklendi!`); }}>
                    {product.stock > 0 ? "Sepete Ekle" : "Tükendi"}
                    </button>
                </div>
                </div>
            </div>
            ))
        ) : (
            <div className="col-12 text-center">
                <div className="alert alert-warning">Aradığınız kriterlere uygun ürün bulunamadı.</div>
            </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
