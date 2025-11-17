import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ForgotPasswordPage() {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { username });
      toast.success('Sıfırlama linki gönderildi (Terminale bakınız!)');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Bir hata oluştu.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card">
        <div className="card-body">
          <h3 className="text-center mb-4">Şifremi Unuttum</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Kullanıcı Adı</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-warning w-100">Sıfırlama Linki Gönder</button>
          </form>
          <div className="text-center mt-3">
            <Link to="/">Giriş Yap'a Dön</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
