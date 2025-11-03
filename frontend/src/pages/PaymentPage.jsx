import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

function PaymentPage() {
  // removeFromCart fonksiyonunu context'ten alıyoruz
  const { cartItems, removeFromCart } = useCart();
  const [message, setMessage] = useState('');

  const totalAmount = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (cartItems.length === 0) {
      setMessage("Sepetiniz boş!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/payment/', 
        { amount: totalAmount },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setMessage(`Ödeme başarılı! ${response.data.paid.toFixed(2)} TL tutarında ödeme yapıldı.`);
      }
    } catch (error) {
      setMessage('Ödeme sırasında bir hata oluştu.');
      console.error('Ödeme hatası:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Alışveriş Sepeti</h1>
      {cartItems.length === 0 ? (
        <p>Sepetiniz şu anda boş.</p>
      ) : (
        <div className="card">
          <ul className="list-group list-group-flush">
            {cartItems.map(item => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                <div>
                  {item.name} (x{item.quantity})
                </div>
                <div>
                  <span>{(item.price * item.quantity).toFixed(2)} TL</span>
                  {/* SİLME BUTONUNU BURAYA EKLEDİK */}
                  <button 
                    className="btn btn-danger btn-sm ms-3" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
              Toplam Tutar:
              <span>{totalAmount.toFixed(2)} TL</span>
            </li>
          </ul>
          <div className="card-body text-center">
            <button className="btn btn-success" onClick={handlePayment}>
              Ödeme Yap
            </button>
          </div>
        </div>
      )}
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}

export default PaymentPage;
