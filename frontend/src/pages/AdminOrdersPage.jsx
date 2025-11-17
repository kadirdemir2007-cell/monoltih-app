import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    
    try {
      const response = await axios.get('http://localhost:5000/api/payment/all-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (err) {
      toast.error("Siparişler yüklenirken hata oluştu. Yetkiniz var mı?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/payment/order/${orderId}`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Sipariş durumu güncellendi.');
      fetchOrders(); // Listeyi yenile
    } catch (err) {
      toast.error('Güncelleme başarısız.');
    }
  };

  if (loading) return <div className="text-center mt-5">Yükleniyor...</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-center">Sipariş Yönetimi</h2>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Sipariş ID</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.username}</td>
                    <td>{order.date}</td>
                    <td className="fw-bold">{order.total_amount.toFixed(2)} TL</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Tamamlandı' ? 'bg-success' :
                        order.status === 'Kargolandı' ? 'bg-primary' :
                        order.status === 'İptal Edildi' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm" 
                        style={{width: '150px'}}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="Hazırlanıyor">Hazırlanıyor</option>
                        <option value="Kargolandı">Kargolandı</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                        <option value="İptal Edildi">İptal Edildi</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
