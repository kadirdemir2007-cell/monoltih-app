import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
    description: '',
    additional_images: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url,
        description: product.description || '',
        additional_images: product.additional_images || ''
    });
    window.scrollTo(0, 0);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '', category: '', image_url: '', description: '', additional_images: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Ürün başarıyla güncellendi!');
        cancelEditing();
      } else {
        await axios.post('http://localhost:5000/api/products/', formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Ürün başarıyla eklendi!');
        setFormData({ name: '', price: '', stock: '', category: '', image_url: '', description: '', additional_images: '' });
      }
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız. Yetkiniz olmayabilir.');
    }
  };

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
      toast.error('Silme işlemi başarısız.');
    }
  };

  if (loading) return <div className="text-center mt-5">Yükleniyor...</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-center">Yönetici Paneli</h2>

      {/* --- YENİ EKLENEN BUTON --- */}
      <div className="text-center mb-4">
        <button className="btn btn-info text-white btn-lg" onClick={() => navigate('/admin/orders')}>
            📦 Siparişleri Yönet
        </button>
      </div>
      {/* -------------------------- */}

      <div className="card mb-5 shadow-sm">
        <div className={`card-header text-white ${editingProduct ? 'bg-warning' : 'bg-primary'}`}>
            {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
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
              <div className="col-12 d-flex gap-2">
                <button type="submit" className={`btn w-100 ${editingProduct ? 'btn-warning' : 'btn-success'}`}>
                    {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
                {editingProduct && (
                    <button type="button" className="btn btn-secondary w-25" onClick={cancelEditing}>İptal</button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

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
                  <button className="btn btn-warning btn-sm me-2" onClick={() => startEditing(product)}>Düzenle</button>
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
