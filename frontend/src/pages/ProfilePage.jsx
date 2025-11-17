import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        // Yeni eklediğimiz geçmiş siparişler endpoint'ine istek atıyoruz
        const response = await axios.get('http://localhost:5000/api/payment/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Siparişler yüklenemedi", error);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Sipariş Geçmişim</h2>
      {orders.length === 0 ? (
        <div className="alert alert-info">Henüz bir siparişiniz bulunmuyor.</div>
      ) : (
        <div className="list-group">
          {orders.map(order => (
            <div key={order.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Sipariş #{order.id}</h5>
                <small className="text-muted">{order.date}</small>
                <p className="mb-1 text-success">{order.status}</p>
              </div>
              <span className="badge bg-primary rounded-pill fs-6">
                {order.total_amount.toFixed(2)} TL
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
