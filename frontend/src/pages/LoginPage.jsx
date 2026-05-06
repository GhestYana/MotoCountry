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
      window.dispatchEvent(new Event('authUpdated'));
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

