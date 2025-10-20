import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', { username, password });
            const receivedToken = response.data.token;
            localStorage.setItem('token', receivedToken); // Token'ı tarayıcıda sakla
            setToken(receivedToken); // App state'ini güncelle
            navigate('/'); // Ana sayfaya yönlendir
        } catch (err) {
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Kullanıcı Adı" required />
                </div>
                <div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" required />
                </div>
                <button type="submit">Giriş Yap</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default LoginPage;