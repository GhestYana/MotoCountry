import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';

const AdminDashboard = () => (
  <div className="admin-overview">
    <h2>Огляд панелі</h2>
    <div className="admin-stats-grid">
      <div className="stat-card">
        <h3>Товари</h3>
        <p className="stat-value">...</p>
      </div>
      <div className="stat-card">
        <h3>Замовлення</h3>
        <p className="stat-value">...</p>
      </div>
      <div className="stat-card">
        <h3>Користувачі</h3>
        <p className="stat-value">...</p>
      </div>
    </div>
  </div>
);

const AdminProductModal = ({ isOpen, onClose, onSave, product, category }) => {
  const [formData, setFormData] = useState({
    name: '', price: '', image: '', image_small: '', brand: '', type: '', 
    availability: 'available', description: '', color: '',
    year: '', engine_displacement: '', power: '', size: '', material: '',
    speed: '', fuel_consumption: '', tank_capacity: '', weight: '',
    tire_diameter: '', suspension: '', brake_system: '', 
    length: '', width: '', height: '', quantity: '', rating: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({ 
        name: '', price: '', image: '', image_small: '', brand: '', type: '', 
        availability: 'available', description: '', color: '',
        year: '', engine_displacement: '', power: '', size: '', material: '',
        speed: '', fuel_consumption: '', tank_capacity: '', weight: '',
        tire_diameter: '', suspension: '', brake_system: '', 
        length: '', width: '', height: '', quantity: '', rating: '',
        ...product 
      });
    } else {
      setFormData({
        name: '', price: '', image: '', image_small: '', brand: '', type: '', 
        availability: 'available', description: '', color: '',
        year: '', engine_displacement: '', power: '', size: '', material: '',
        speed: '', fuel_consumption: '', tank_capacity: '', weight: '',
        tire_diameter: '', suspension: '', brake_system: '', 
        length: '', width: '', height: '', quantity: '', rating: ''
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal large">
        <h3>{product ? 'Редагувати' : 'Додати'} товар ({category})</h3>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-sections">
            <section className="form-section">
              <h4>Основна інформація</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Назва*</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Ціна (грн)*</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Кількість</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Бренд</label>
                  <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Тип</label>
                  <input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Наявність</label>
                  <select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})}>
                    <option value="available">В наявності</option>
                    <option value="not available">Немає в наявності</option>
                    <option value="expected">Очікується</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Колір</label>
                  <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Рейтинг</label>
                  <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h4>Зображення</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Головне зображення (URL)</label>
                  <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Мале зображення (URL)</label>
                  <input value={formData.image_small} onChange={e => setFormData({...formData, image_small: e.target.value})} />
                </div>
              </div>
            </section>

            {category === 'motorcycles' && (
              <section className="form-section">
                <h4>Технічні характеристики</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Рік</label>
                    <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Об'єм двигуна</label>
                    <input value={formData.engine_displacement} onChange={e => setFormData({...formData, engine_displacement: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Потужність (к.с.)</label>
                    <input value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Швидкість (км/год)</label>
                    <input value={formData.speed} onChange={e => setFormData({...formData, speed: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Розхід палива</label>
                    <input value={formData.fuel_consumption} onChange={e => setFormData({...formData, fuel_consumption: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Об'єм бака</label>
                    <input value={formData.tank_capacity} onChange={e => setFormData({...formData, tank_capacity: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Вага (кг)</label>
                    <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                  </div>
                </div>
                
                <h4 style={{marginTop: '20px'}}>Шасі та Розміри</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Підвіска</label>
                    <input value={formData.suspension} onChange={e => setFormData({...formData, suspension: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Гальма</label>
                    <input value={formData.brake_system} onChange={e => setFormData({...formData, brake_system: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Діаметр шин</label>
                    <input value={formData.tire_diameter} onChange={e => setFormData({...formData, tire_diameter: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Габарити (Д x Ш x В)</label>
                    <div style={{display: 'flex', gap: '5px'}}>
                      <input placeholder="Д" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} />
                      <input placeholder="Ш" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} />
                      <input placeholder="В" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(category === 'equipment') && (
              <section className="form-section">
                <h4>Додаткові поля</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Розмір</label>
                    <input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Матеріал</label>
                    <input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
                  </div>
                </div>
              </section>
            )}

            {(category === 'components') && (
              <section className="form-section">
                <h4>Додаткові поля</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Параметри</label>
                    <input value={formData.parameters} onChange={e => setFormData({...formData, parameters: e.target.value})} placeholder="напр: 600cc, 120hp" />
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="form-group full-width" style={{marginTop: '20px'}}>
            <label>Опис</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Скасувати</button>
            <button type="submit" className="save-btn">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('motorcycles');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${category}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [category]);

  const handleSave = async (formData) => {
    const token = localStorage.getItem('token');
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/${category}/${editingProduct.id}` : `/api/${category}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert('Помилка при збереженні');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей товар?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/${category}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-products">
      <div className="admin-header-actions">
        <h2>Керування товарами</h2>
        <button className="add-btn" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          + Додати товар
        </button>
      </div>

      <div className="admin-tabs">
        <button className={category === 'motorcycles' ? 'active' : ''} onClick={() => setCategory('motorcycles')}>Мотоцикли</button>
        <button className={category === 'equipment' ? 'active' : ''} onClick={() => setCategory('equipment')}>Екіпірування</button>
        <button className={category === 'components' ? 'active' : ''} onClick={() => setCategory('components')}>Запчастини</button>
      </div>
      
      {loading ? (
        <div className="admin-loading">Завантаження...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Зображення</th>
              <th>Назва</th>
              <th>Ціна</th>
              <th>Бренд</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><small>{p.id}</small></td>
                <td><img src={p.image} alt="" className="admin-table-img" /></td>
                <td>{p.name}</td>
                <td>{p.price} грн</td>
                <td>{p.brand}</td>
                <td>
                  <div className="table-actions">
                    <button className="edit-btn" onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}>Редагувати</button>
                    <button className="del-btn" onClick={() => handleDelete(p.id)}>Видалити</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AdminProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct}
        category={category}
        onSave={handleSave}
      />
    </div>
  );
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      setAuthorized(true);
    }
  }, [navigate]);

  if (!authorized) return null;

  return (
    <div className="admin-page-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h3>Панель Адміна</h3>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin">Огляд</Link>
          <Link to="/admin/products">Товари</Link>
          <Link to="/admin/users">Користувачі</Link>
          <Link to="/admin/orders">Замовлення</Link>
        </nav>
      </aside>
      
      <main className="admin-main-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/users" element={<h2>Керування користувачами</h2>} />
          <Route path="/orders" element={<h2>Керування замовленнями</h2>} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;
