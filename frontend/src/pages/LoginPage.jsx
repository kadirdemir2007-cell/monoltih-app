import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
// react-icons'dan göz ikonlarını import ediyoruz
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  // Şifrenin görünür olup olmadığını tutacak state
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

  // İkona tıklandığında showPassword state'ini tersine çevirir
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
                {/* Şifre Alanı ve İkon */}
                <div className="mb-3 position-relative"> {/* İkonu konumlandırmak için */}
                  <label htmlFor="password">Şifre</label>
                  <input
                    // type özelliğini state'e göre dinamik olarak değiştiriyoruz
                    type={showPassword ? "text" : "password"} 
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Göz İkonu */}
                  <span 
                    onClick={togglePasswordVisibility} 
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '38px', // Label'dan sonraki inputun yüksekliğine göre ayarlayın
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
              {message && <p className="mt-3 text-center">{message}</p>}
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
