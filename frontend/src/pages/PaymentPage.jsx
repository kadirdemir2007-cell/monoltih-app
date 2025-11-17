import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// İkonlar için react-icons kullanıyoruz
import { FaTrash, FaPlus, FaMinus, FaTruck, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

function PaymentPage() {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Toplam tutarı hesapla
  const totalAmount = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Lütfen önce giriş yapın.");
        return;
    }
    if (cartItems.length === 0) {
      toast.warning("Sepetiniz boş!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payment/', 
        { amount: totalAmount },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success(`Siparişiniz alındı! Tutar: ${response.data.paid.toFixed(2)} TL`);
        setTimeout(() => navigate('/profile'), 2000); // Başarılı olunca profil/siparişler sayfasına git
      }
    } catch (error) {
      toast.error('Ödeme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sepet Boşsa Gösterilecek Ekran
  if (cartItems.length === 0) {
    return (
        <div className="container mt-5 text-center">
            <div className="p-5 bg-white rounded shadow-sm">
                <h2 className="mb-3">Sepetiniz şu an boş 😔</h2>
                <p className="text-muted">Hemen alışverişe başlayıp sepetinizi doldurabilirsiniz.</p>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Ürünleri İncele</button>
            </div>
        </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        
        {/* SOL SÜTUN: ÜRÜN LİSTESİ */}
        <div className="col-lg-9 col-md-8">
          <h4 className="mb-3">Sepetim ({cartItems.length} Ürün)</h4>
          
          {cartItems.map(item => (
            <div className="card mb-3 shadow-sm border-0" key={item.id}>
              <div className="card-body">
                <div className="row align-items-center">
                  
                  {/* Resim Alanı */}
                  <div className="col-3 col-md-2">
                    <div className="border rounded p-2 d-flex align-items-center justify-content-center" style={{height: '100px', backgroundColor: '#fff'}}>
                        <img src={item.image_url} alt={item.name} className="img-fluid" style={{maxHeight: '100%', objectFit: 'contain'}} />
                    </div>
                  </div>

                  {/* Bilgi Alanı */}
                  <div className="col-9 col-md-6">
                    <h6 className="mb-1 text-truncate">{item.name}</h6>
                    <p className="text-muted small mb-1">Kategori: {item.category}</p>
                    <p className="text-success small mb-1">
                        <FaTruck className="me-1" /> 
                        Yarın Kargoda (Ücretsiz)
                    </p>
                    <p className="text-success small fw-bold">
                        <FaCheckCircle className="me-1" /> 
                        Stokta {item.stock} adet
                    </p>
                  </div>

                  {/* Adet ve Fiyat Alanı */}
                  <div className="col-12 col-md-4 mt-3 mt-md-0 d-flex flex-column align-items-end justify-content-between">
                     
                     {/* Fiyat */}
                     <span className="fs-5 fw-bold text-primary mb-2">{(item.price * item.quantity).toFixed(2)} TL</span>

                     {/* Adet Kontrolü */}
                     <div className="d-flex align-items-center border rounded px-2 py-1 bg-light">
                        <button 
                            className="btn btn-sm btn-link text-dark text-decoration-none p-0" 
                            onClick={() => removeFromCart(item.id)}
                        >
                            <FaMinus size={12} />
                        </button>
                        <span className="mx-3 fw-bold">{item.quantity}</span>
                        <button 
                            className="btn btn-sm btn-link text-dark text-decoration-none p-0" 
                            disabled={item.quantity >= item.stock}
                            onClick={() => addToCart(item)}
                        >
                            <FaPlus size={12} />
                        </button>
                     </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SAĞ SÜTUN: SİPARİŞ ÖZETİ */}
        <div className="col-lg-3 col-md-4">
            <div className="card shadow-sm border-0 sticky-top" style={{top: '20px'}}>
                <div className="card-body">
                    <h5 className="card-title mb-4">Seçilen Ürünler</h5>
                    
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Ara Toplam</span>
                        <span className="fw-bold">{totalAmount.toFixed(2)} TL</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                        <span className="text-muted">Kargo</span>
                        <span className="text-success fw-bold">Bedava</span>
                    </div>
                    
                    <hr />

                    <div className="d-flex justify-content-between mb-4">
                        <span className="fs-5 fw-bold">Toplam</span>
                        <span className="fs-4 fw-bold text-primary">{totalAmount.toFixed(2)} TL</span>
                    </div>

                    <button 
                        className="btn btn-primary w-100 py-2 fs-6 fw-bold" 
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'İşleniyor...' : 'Alışverişi Tamamla'}
                    </button>

                    <div className="mt-3 text-center text-muted small">
                        <FaShieldAlt className="me-1 text-success" /> 
                        Güvenli Alışveriş
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default PaymentPage;
