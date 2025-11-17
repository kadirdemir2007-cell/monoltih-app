import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBoxOpen, FaUserCog, FaSave } from 'react-icons/fa';

function ProfilePage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' veya 'settings'
  const navigate = useNavigate();

  // Profil Güncelleme State'leri
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    try {
      const response = await axios.get('http://localhost:5000/api/payment/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Siparişler yüklenemedi", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
        toast.error("Şifreler eşleşmiyor!");
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const payload = {};
        if (username) payload.username = username;
        if (password) payload.password = password;

        await axios.put('http://localhost:5000/api/auth/update', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        toast.success("Profiliniz güncellendi!");
        setPassword('');
        setConfirmPassword('');
    } catch (err) {
        toast.error(err.response?.data?.error || "Güncelleme başarısız.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-center">Hesabım</h2>

      {/* SEKMELER (TABS) */}
      <ul className="nav nav-tabs mb-4 justify-content-center">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            <FaBoxOpen className="me-2"/> Siparişlerim
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('settings')}
          >
            <FaUserCog className="me-2"/> Ayarlar
          </button>
        </li>
      </ul>

      {/* SİPARİŞLER SEKMESİ */}
      {activeTab === 'orders' && (
        <div className="fade-in">
          {orders.length === 0 ? (
            <div className="alert alert-info text-center">Henüz bir siparişiniz bulunmuyor.</div>
          ) : (
            <div className="list-group">
              {orders.map(order => (
                <div key={order.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                  <div>
                    <h5 className="mb-1 text-primary">Sipariş #{order.id}</h5>
                    <small className="text-muted">{order.date}</small>
                    <p className="mb-0 mt-1">
                        Durum: <span className={`badge ${order.status === 'Tamamlandı' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.status}</span>
                    </p>
                  </div>
                  <span className="fs-5 fw-bold">
                    {order.total_amount.toFixed(2)} TL
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AYARLAR SEKMESİ */}
      {activeTab === 'settings' && (
        <div className="row justify-content-center fade-in">
            <div className="col-md-6">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Bilgileri Güncelle</h5>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-3">
                                <label>Yeni Kullanıcı Adı (İsteğe Bağlı)</label>
                                <input type="text" className="form-control" 
                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    value={username} onChange={(e) => setUsername(e.target.value)} 
                                />
                            </div>
                            <hr />
                            <div className="mb-3">
                                <label>Yeni Şifre</label>
                                <input type="password" class="form-control" 
                                    placeholder="Yeni şifre"
                                    value={password} onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>
                            <div className="mb-3">
                                <label>Yeni Şifre (Tekrar)</label>
                                <input type="password" class="form-control" 
                                    placeholder="Yeni şifreyi doğrulayın"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100">
                                <FaSave className="me-2" /> Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
