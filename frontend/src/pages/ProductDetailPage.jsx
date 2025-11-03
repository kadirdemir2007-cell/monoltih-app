import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetailPage() {
  // URL'den productId parametresini almak için useParams hook'unu kullanıyoruz
  const { productId } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetail = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Detayları görmek için giriş yapmalısınız.');
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Backend'deki yeni endpoint'e productId ile istek atıyoruz
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProduct(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Ürün bulunamadı.');
        } else {
          setError('Ürün detayları yüklenirken bir hata oluştu.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId, navigate]); // productId değiştiğinde useEffect tekrar çalışır

  if (loading) {
    return <div className="container mt-5 text-center"><p>Yükleniyor...</p></div>;
  }

  if (error) {
    return <div className="container mt-5 text-center"><p className="text-danger">{error}</p></div>;
  }

  if (!product) {
    return null; // Ürün yoksa hiçbir şey gösterme (ya da "Ürün bulunamadı" mesajı)
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img src={product.image_url} className="img-fluid" alt={product.name} />
        </div>
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <p className="fs-4">{product.price.toFixed(2)} TL</p>
          {/* AÇIKLAMA İÇİN BU SATIRI EKLEDİK */}
          <p>{product.description}</p>
          {/* Buraya daha sonra ürün açıklaması eklenebilir */}
          <button className="btn btn-primary">Sepete Ekle</button> {/* Şimdilik çalışmıyor */}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
