import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingCart, Bell, ChevronDown, Sun, Moon, Menu, X } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { useTheme } from '../hooks/useTheme';
import '../styles/Header.css';

const Header = () => {
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [cartItemCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (_) { }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) { }
  };

  useEffect(() => {
    const updateHeaderState = () => {
      // Cart Count
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalItems);

      // Auth & Admin Status
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const loggedIn = !!user && !!token;
      setIsLoggedIn(loggedIn);
      setIsAdmin(user && user.role === 'admin');

      if (loggedIn) fetchNotifications();
    };

    updateHeaderState();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);

    window.addEventListener('storage', updateHeaderState);
    window.addEventListener('cartUpdated', updateHeaderState);
    window.addEventListener('authUpdated', updateHeaderState);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateHeaderState);
      window.removeEventListener('cartUpdated', updateHeaderState);
      window.removeEventListener('authUpdated', updateHeaderState);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('query', search);
      navigate(`/search?${currentParams.toString()}`);
    }
  };


  return (
    <header className="main-header">
      <div className="header-top">
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <Link to="/" className="logo">
          <span className="logo-moto">MOTO</span>
          <span className="logo-country">COUNTRY</span>
        </Link>

        <nav className={`top-nav ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
          <Link to="/delivery" onClick={() => setIsMobileMenuOpen(false)}>Доставка і оплата</Link>
          <Link to="/returns" onClick={() => setIsMobileMenuOpen(false)}>Повернення та обмін</Link>
          <Link to="/contacts" onClick={() => setIsMobileMenuOpen(false)}>Контакти</Link>
          {isAdmin && (
            <Link to="/admin" className="admin-link-highlight" onClick={() => setIsMobileMenuOpen(false)}>Панель Адміна</Link>
          )}
        </nav>

        <div className="search-container">
          <Search className="search-icon" size={20} />

          <input
            type="text"
            className="search-input"
            placeholder="Пошук"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="header-icons">
          <button className="currency-toggle-btn" onClick={toggleCurrency} title="Змінити валюту">
            {currency === 'USD' ? '$' : '₴'}
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Змінити тему">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to={isLoggedIn ? "/profile" : "/login"} className="icon-btn">
            <User size={24} />
          </Link>
          <Link to="/favorites" className="icon-btn">
            <Heart size={24} />
          </Link>
          <Link to="/cart-items" className="icon-btn">
            <ShoppingCart size={24} />
            {cartItemCount > 0 && <span className="cart-item-badge">{cartItemCount}</span>}
          </Link>
          <button className="icon-btn" onClick={() => { setShowNotifications(v => !v); if (!showNotifications && unreadCount > 0) markAllRead(); }}>
            <Bell size={24} />
            {unreadCount > 0 && <span className="cart-item-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div ref={notifRef} className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Сповіщення</span>
                {notifications.length > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>Прочитати всі</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="notif-empty">Немає сповіщень</p>
              ) : (
                <ul className="notif-list">
                  {notifications.map(n => (
                    <li key={n.id} className={`notif-item${n.is_read ? '' : ' notif-unread'}`}>
                      <span className="notif-msg">{n.message}</span>
                      <span className="notif-date">{new Date(n.created_at).toLocaleDateString('uk-UA')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header-divider"></div>

      <div className={`category-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="category-item">
          <button className="category-btn" onClick={() => { navigate('/moto'); setIsMobileMenuOpen(false); }}>
            Мотоцикли
            <ChevronDown size={14} />
          </button>
          <div className="dropdown-menu">
            <Link to="/moto?type=Sport" onClick={() => setIsMobileMenuOpen(false)}>Sport</Link>
            <Link to="/moto?type=Cruiser" onClick={() => setIsMobileMenuOpen(false)}>Cruiser</Link>
            <Link to="/moto?type=Adventure" onClick={() => setIsMobileMenuOpen(false)}>Adventure</Link>
            <Link to="/moto?type=Scooter" onClick={() => setIsMobileMenuOpen(false)}>Scooter</Link>
            <Link to="/moto?type=Naked" onClick={() => setIsMobileMenuOpen(false)}>Naked</Link>
            <Link to="/moto?type=Enduro" onClick={() => setIsMobileMenuOpen(false)}>Enduro</Link>
            <Link to="/moto?type=Motocross" onClick={() => setIsMobileMenuOpen(false)}>Motocross</Link>
          </div>
        </div>
        <div className="category-item">
          <button className="category-btn" onClick={() => { navigate('/equipment'); setIsMobileMenuOpen(false); }}>
            Екіпірування
            <ChevronDown size={14} />
          </button>

          <div className="dropdown-menu">
            <Link to="/equipment?type=Шоломи" onClick={() => setIsMobileMenuOpen(false)}>Шоломи</Link>
            <Link to="/equipment?type=Куртки" onClick={() => setIsMobileMenuOpen(false)}>Куртки</Link>
            <Link to="/equipment?type=Рукавички" onClick={() => setIsMobileMenuOpen(false)}>Рукавички</Link>
            <Link to="/equipment?type=Мотовзуття" onClick={() => setIsMobileMenuOpen(false)}>Мотовзуття</Link>
            <Link to="/equipment?type=Мотоштани" onClick={() => setIsMobileMenuOpen(false)}>Мотоштани</Link>
            <Link to="/equipment?type=Комбінезони" onClick={() => setIsMobileMenuOpen(false)}>Комбінезони</Link>
            <Link to="/equipment?type=Мотожилети" onClick={() => setIsMobileMenuOpen(false)}>Мотожилети</Link>
            <Link to="/equipment?type=Окуляри" onClick={() => setIsMobileMenuOpen(false)}>Окуляри</Link>
            <Link to="/equipment?type=Моточерепахи" onClick={() => setIsMobileMenuOpen(false)}>Моточерепахи</Link>
            <Link to="/equipment?type=Наколінники" onClick={() => setIsMobileMenuOpen(false)}>Наколінники</Link>
            <Link to="/equipment?type=Налокітники" onClick={() => setIsMobileMenuOpen(false)}>Налокітники</Link>
          </div>
        </div>
        <div className="category-item">
          <button className="category-btn" onClick={() => { navigate('/components'); setIsMobileMenuOpen(false); }}>
            Запчастини
            <ChevronDown size={14} />
          </button>
          <div className="dropdown-menu">
            <Link to="/components?type=Двигун" onClick={() => setIsMobileMenuOpen(false)}>Двигун</Link>
            <Link to="/components?type=Трансмісія" onClick={() => setIsMobileMenuOpen(false)}>Трансмісія</Link>
            <Link to="/components?type=Гальмівна система" onClick={() => setIsMobileMenuOpen(false)}>Гальма</Link>
            <Link to="/components?type=Електросистема" onClick={() => setIsMobileMenuOpen(false)}>Електроніка</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
