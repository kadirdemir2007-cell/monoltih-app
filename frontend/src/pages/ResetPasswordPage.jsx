import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ResetPasswordPage() {
  const { token } = useParams(); // URL'den token'ı alıyoruz
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { 
        token, 
        new_password: newPassword 
      });
      toast.success('Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sıfırlama başarısız.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card">
        <div className="card-body">
          <h3 className="text-center mb-4">Yeni Şifre Belirle</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Yeni Şifre</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Şifreyi Güncelle</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
