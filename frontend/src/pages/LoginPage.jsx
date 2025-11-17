import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      setMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/products'), 1000); 
    } catch (error) {
      setMessage(error.response?.data?.error || 'Bir hata oluştu.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Giriş Yap</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username">Kullanıcı Adı</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password">Şifre</label>
                  <input
                    type={showPassword ? "text" : "password"} 
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span 
                    onClick={togglePasswordVisibility} 
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '38px', 
                      cursor: 'pointer' 
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Giriş Yap</button>
                </div>
              </form>

              {/* ŞİFREMİ UNUTTUM LİNKİ - YENİ EKLENDİ */}
              <div className="text-end mt-2">
                  <Link to="/forgot-password" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>Şifremi Unuttum</Link>
              </div>

              {message && <p className="mt-3 text-center text-danger">{message}</p>}
              
              <div className="text-center mt-3">
                <p>Hesabın yok mu? <Link to="/register">Kayıt Ol</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
