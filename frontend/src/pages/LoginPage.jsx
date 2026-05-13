import React from 'react';
import { useState } from 'react';
import '../styles/LoginPage.css';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const isLoggedIn = !!localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Notify header and other components
    window.dispatchEvent(new Event('authUpdated'));
    navigate('/login'); // Refresh current view
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Merge local cart with server-side cart
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (localCart.length > 0) {
        try {
          await Promise.all(localCart.map(item => 
            fetch('/api/cart-items/add-item', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
              },
              body: JSON.stringify({ 
                userId: data.user.id, 
                prodId: item.id, 
                category: item.category,
                quantity: item.quantity || 1
              })
            })
          ));
          // Clear local cart after successful migration (CartPage will refetch fresh data)
          localStorage.removeItem('cart');
        } catch (err) {
          console.error("Failed to merge cart:", err);
        }
      }

      // Merge local favorites with server-side favorites
      const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      if (localFavorites.length > 0) {
        try {
          await Promise.all(localFavorites.map(item => 
            fetch('/api/favorites/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
              },
              body: JSON.stringify({ 
                userId: data.user.id, 
                prodId: item.id, 
                category: item.category
              })
            })
          ));
          localStorage.removeItem('favorites');
        } catch (err) {
          console.error("Failed to merge favorites:", err);
        }
      }

      window.dispatchEvent(new Event('authUpdated'));
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('favoritesUpdated'));
      navigate('/');

    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {isLoggedIn ? (
          <div className="logged-in-view">
            <h1 className="login-title">Ви вже авторизовані</h1>
            <p className="login-desc" style={{ color: '#ccc', marginBottom: '20px' }}>
              Бажаєте вийти з облікового запису?
            </p>
            <button onClick={handleLogout} className="login-button">Вийти</button>
            <div className="login-link" style={{ marginTop: '20px' }}>
              <Link to="/">Повернутися на головну</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="login-title">Авторизація</h1>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className='email' htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="login-button">Увійти</button>
            </form>
            <div className="login-link">
              <p>Don't have an account?</p>
              <Link to="/register">Register here</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

