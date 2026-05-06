import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="header-top">
        <Link to="/" className="logo">
          <span className="logo-moto">MOTO</span>
          <span className="logo-country">COUNTRY</span>
        </Link>

        <nav className="top-nav">
          <Link to="/delivery">Доставка і оплата</Link>
          <Link to="/returns">Повернення та обмін</Link>
          <Link to="/contacts">Контакти</Link>
        </nav>

        <div className="search-container">
          <svg
            className="search-icon"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" className="search-input" placeholder="Пошук" />
        </div>

        <div className="header-icons">
          <Link to="/login" className="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <Link to="/favorites" className="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </Link>
          <Link to="/cart-items" className="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button className="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="header-divider"></div>

      <div className="category-nav">
        <div className="category-item">
          <button className="category-btn" onClick={() => navigate('/moto')}>
            Мотоцикли
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </button>
          <div className="dropdown-menu">
            <Link to="/moto?type=Sport">Sport</Link>
            <Link to="/moto?type=Cruiser">Cruiser</Link>
            <Link to="/moto?type=Adventure">Adventure</Link>
            <Link to="/moto?type=Scooter">Scooter</Link>
            <Link to="/moto?type=Naked">Naked</Link>
            <Link to="/moto?type=Enduro">Enduro</Link>
            <Link to="/moto?type=Motocross">Motocross</Link>
          </div>
        </div>
        <div className="category-item">
          <button className="category-btn" onClick={() => navigate('/equipment')}>
            Екіпірування
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </button>

          <div className="dropdown-menu">
            <Link to="/equipment?type=Шоломи">Шоломи</Link>
            <Link to="/equipment?type=Куртки">Куртки</Link>
            <Link to="/equipment?type=Рукавички">Рукавички</Link>
            <Link to="/equipment?type=Мотовзуття">Мотовзуття</Link>
            <Link to="/equipment?type=Мотоштани">Мотоштани</Link>
            <Link to="/equipment?type=Комбінезони">Комбінезони</Link>
            <Link to="/equipment?type=Мотожилети">Мотожилети</Link>
            <Link to="/equipment?type=Окуляри">Окуляри</Link>
            <Link to="/equipment?type=Моточерепахи">Моточерепахи</Link>
            <Link to="/equipment?type=Наколінники">Наколінники</Link>
            <Link to="/equipment?type=Кросові панцири">Кросові панцири</Link>
            <Link to="/equipment?type=Налокітники">Налокітники</Link>
          </div>
        </div>
        <div className="category-item">
          <button className="category-btn" onClick={() => navigate('/components')}>
            Запчастини
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </button>
          <div className="dropdown-menu">
            <Link to="/components?type=Двигун">Двигун</Link>
            <Link to="/components?type=Трансмісія">Трансмісія</Link>
            <Link to="/components?type=Гальмівна система">Гальма</Link>
            <Link to="/components?type=Електросистема">Електроніка</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
