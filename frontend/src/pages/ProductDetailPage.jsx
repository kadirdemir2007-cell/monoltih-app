import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(null);
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const fetchProductDetail = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTimeout(() => navigate('/'), 3000);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProduct(response.data);
      if (!selectedImage && response.data.images && response.data.images.length > 0) {
          setSelectedImage(response.data.images[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Ürün detayları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [productId, navigate]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        await axios.post(`http://localhost:5000/api/products/${productId}/reviews`, 
            { content: newComment, rating: rating },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Yorumunuz ve puanınız eklendi!');
        setNewComment('');
        setRating(5);
        fetchProductDetail();
    } catch (err) {
        toast.error('Yorum eklenirken hata oluştu.');
    }
  };

  if (loading) return <div className="text-center mt-5"><p>Yükleniyor...</p></div>;
  if (error) return <div className="text-center mt-5 text-danger"><p>{error}</p></div>;
  if (!product) return null;

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        {/* SOL TARAF: RESİMLER */}
        <div className="col-md-6">
          <div className="mb-3 text-center border rounded p-3">
            <img src={selectedImage || product.image_url} className="img-fluid" alt={product.name} style={{ maxHeight: '400px', objectFit: 'contain' }} />
          </div>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {product.images && product.images.map((img, index) => (
                <img key={index} src={img} alt={`slide-${index}`} onClick={() => setSelectedImage(img)}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', border: selectedImage === img ? '2px solid #0d6efd' : '1px solid #ddd', borderRadius: '5px' }}
                />
            ))}
          </div>
        </div>

        {/* SAĞ TARAF: BİLGİLER */}
        <div className="col-md-6">
          <h1 className="display-5 fw-bold">{product.name}</h1>
          <div className="mb-2">
             <span className="badge bg-secondary me-2">{product.category}</span>
             <span className="text-warning fs-5">
               <FaStar /> {product.avg_rating || 0} / 5
             </span>
             <span className="text-muted ms-2">({product.reviews ? product.reviews.length : 0} değerlendirme)</span>
          </div>
          <p className="fs-3 text-primary fw-bold">{product.price.toFixed(2)} TL</p>
          <div className="card bg-light mb-4">
              <div className="card-body"><p className="card-text">{product.description}</p></div>
          </div>
          <button className="btn btn-primary btn-lg w-100 mt-2" disabled={product.stock === 0}
            onClick={() => { addToCart(product); toast.success(`${product.name} sepete eklendi!`); }}>
            {product.stock > 0 ? 'Sepete Ekle' : 'Tükendi'}
          </button>
        </div>
      </div>

      {/* --- YORUMLAR VE PUANLAMA --- */}
      <div className="row mt-5">
          <div className="col-12">
              <h3 className="border-bottom pb-2">Değerlendirmeler</h3>
              
              {/* Yorum Formu */}
              <div className="card mb-4 mt-3 shadow-sm">
                  <div className="card-body">
                      <h5 className="card-title">Yorum Yap ve Puan Ver</h5>
                      <form onSubmit={handleCommentSubmit}>
                          {/* Yıldız Seçimi */}
                          <div className="mb-3">
                            {[...Array(5)].map((star, index) => {
                              const ratingValue = index + 1;
                              return (
                                <label key={index}>
                                  <input 
                                    type="radio" 
                                    name="rating" 
                                    value={ratingValue} 
                                    style={{ display: 'none' }} 
                                    onClick={() => setRating(ratingValue)}
                                  />
                                  <FaStar 
                                    className="star" 
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                                    size={25}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(null)}
                                    style={{ cursor: 'pointer', transition: 'color 200ms' }}
                                  />
                                </label>
                              );
                            })}
                            <span className="ms-2 fw-bold">{rating} Yıldız</span>
                          </div>

                          <div className="mb-3">
                              <textarea className="form-control" rows="3" placeholder="Bu ürün hakkında ne düşünüyorsunuz?"
                                  value={newComment} onChange={(e) => setNewComment(e.target.value)} required
                              ></textarea>
                          </div>
                          <button type="submit" className="btn btn-primary">Gönder</button>
                      </form>
                  </div>
              </div>

              {/* Yorum Listesi */}
              {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map(review => (
                      <div key={review.id} className="card mb-3 border-0 border-bottom">
                          <div className="card-body">
                              <div className="d-flex justify-content-between">
                                  <h6 className="card-title fw-bold">{review.username}</h6>
                                  <small className="text-muted">{review.date}</small>
                              </div>
                              <div className="mb-2 text-warning">
                                {[...Array(review.rating)].map((_, i) => <FaStar key={i} size={15}/>)}
                              </div>
                              <p className="card-text">{review.content}</p>
                          </div>
                      </div>
                  ))
              ) : (
                  <p className="text-muted text-center py-4">Henüz değerlendirme yapılmamış. İlk yorumu sen yap!</p>
              )}
          </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
