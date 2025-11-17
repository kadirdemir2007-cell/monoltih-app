import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Yeni Ürün Formu İçin State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
    description: '',
    additional_images: ''
  });

  // Token Kontrolü ve Veri Çekme
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/products/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      toast.error("Ürünler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Form Değişikliklerini Yakalama
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ürün Ekleme
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/products/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Ürün başarıyla eklendi!');
      setFormData({ name: '', price: '', stock: '', category: '', image_url: '', description: '', additional_images: '' }); // Formu temizle
      fetchProducts(); // Listeyi güncelle
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ürün eklenirken hata oluştu. Yetkiniz var mı?');
    }
  };

  // Ürün Silme
  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Ürün silindi.');
      fetchProducts();
    } catch (err) {
      toast.error('Silme işlemi başarısız. Yetkiniz olmayabilir.');
    }
  };

  if (loading) return <div className="text-center mt-5">Yükleniyor...</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-center">Yönetici Paneli</h2>

      {/* Ürün Ekleme Formu */}
      <div className="card mb-5 shadow-sm">
        <div className="card-header bg-primary text-white">Yeni Ürün Ekle</div>
        <div className="card-body">
          <form onSubmit={handleAddProduct}>
            <div className="row g-3">
              <div className="col-md-6">
                <input type="text" name="name" className="form-control" placeholder="Ürün Adı" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <input type="number" name="price" className="form-control" placeholder="Fiyat (TL)" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <input type="number" name="stock" className="form-control" placeholder="Stok" value={formData.stock} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <input type="text" name="category" className="form-control" placeholder="Kategori" value={formData.category} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <input type="text" name="image_url" className="form-control" placeholder="Ana Resim URL" value={formData.image_url} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <textarea name="description" className="form-control" placeholder="Ürün Açıklaması" value={formData.description} onChange={handleChange} />
              </div>
              <div className="col-12">
                <input type="text" name="additional_images" className="form-control" placeholder="Ekstra Resim URL'leri (Virgülle ayırın)" value={formData.additional_images} onChange={handleChange} />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success w-100">Ürünü Ekle</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Ürün Listesi Tablosu */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Resim</th>
              <th>Ürün Adı</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} /></td>
                <td>{product.name}</td>
                <td><span className="badge bg-secondary">{product.category}</span></td>
                <td>{product.price} TL</td>
                <td>{product.stock}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
