import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingCart, Bell, ChevronDown, ChevronRight, Sun, Moon, Menu, X } from 'lucide-react';
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
  const [openSubmenu, setOpenSubmenu] = useState(null); // 'moto' | 'equip' | 'comp'

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setNotifications(await res.json());
    } catch (_) { }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) { }
  };

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cart.reduce((t, i) => t + i.quantity, 0));
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const loggedIn = !!user && !!token;
      setIsLoggedIn(loggedIn);
      setIsAdmin(user && user.role === 'admin');
      if (loggedIn) fetchNotifications();
    };
    update();
    const interval = setInterval(fetchNotifications, 30000);
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdated', update);
    window.addEventListener('authUpdated', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', update);
      window.removeEventListener('cartUpdated', update);
      window.removeEventListener('authUpdated', update);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMenu = () => { setIsMobileMenuOpen(false); setOpenSubmenu(null); };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const p = new URLSearchParams(window.location.search);
      p.set('query', search);
      navigate(`/search?${p.toString()}`);
    }
  };

  return (
    <header className="main-header">

      {/* ── MAIN HEADER ROW ── */}
      <div className="header-top">
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <Link to="/" className="logo">
          <span className="logo-moto">MOTO</span>
          <span className="logo-country">COUNTRY</span>
        </Link>

        <nav className="top-nav">
          <Link to="/delivery">Доставка і оплата</Link>
          <Link to="/returns">Повернення та обмін</Link>
          <Link to="/contacts">Контакти</Link>
          {isAdmin && <Link to="/admin" className="admin-link-highlight">Панель Адміна</Link>}
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
          <Link to={isLoggedIn ? '/profile' : '/login'} className="icon-btn"><User size={24} /></Link>
          <Link to="/favorites" className="icon-btn"><Heart size={24} /></Link>
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
                {notifications.length > 0 && <button className="notif-mark-all" onClick={markAllRead}>Прочитати всі</button>}
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

      <div className="header-divider" />

      {/* ── DESKTOP CATEGORY NAV ── */}
      <div className="category-nav">
        <div className="category-item">
          <button className="category-btn" onClick={() => navigate('/moto')}>Мотоцикли <ChevronDown size={14} /></button>
          <div className="dropdown-menu">
            {['Sport', 'Cruiser', 'Adventure', 'Scooter', 'Naked', 'Enduro', 'Motocross'].map(t => (
              <Link key={t} to={`/moto?type=${t}`}>{t}</Link>
            ))}
          </div>
        </div>
        <div className="category-item">
          <button className="category-btn" onClick={() => navigate('/equipment')}>Екіпірування <ChevronDown size={14} /></button>
          <div className="dropdown-menu">
            {['Шоломи', 'Куртки', 'Рукавички', 'Мотовзуття', 'Мотоштани', 'Комбінезони', 'Мотожилети', 'Окуляри', 'Моточерепахи', 'Наколінники', 'Налокітники'].map(t => (
              <Link key={t} to={`/equipment?type=${t}`}>{t}</Link>
            ))}
          </div>
        </div>
        <div className="category-item">
          <button className="category-btn" onClick={() => navigate('/components')}>Запчастини <ChevronDown size={14} /></button>
          <div className="dropdown-menu">
            {[['Двигун', 'Двигун'], ['Трансмісія', 'Трансмісія'], ['Гальмівна система', 'Гальма'], ['Електросистема', 'Електроніка']].map(([type, label]) => (
              <Link key={type} to={`/components?type=${type}`}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE BURGER MENU ── */}
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={closeMenu} />}

      <nav className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
        {/* Info links strip at top */}
        <div className="mobile-menu-info">
          <Link to="/delivery" onClick={closeMenu}>Доставка і оплата</Link>
          <Link to="/returns" onClick={closeMenu}>Повернення та обмін</Link>
          <Link to="/contacts" onClick={closeMenu}>Контакти</Link>
          {isAdmin && <Link to="/admin" onClick={closeMenu} className="admin-link-highlight">Адмін-панель</Link>}
        </div>

        <div className="mobile-menu-divider" />

        {/* Categories */}
        <div className="mobile-menu-categories">

          {/* Мотоцикли */}
          <div className="mobile-cat-item">
            <button className="mobile-cat-btn" onClick={() => setOpenSubmenu(openSubmenu === 'moto' ? null : 'moto')}>
              <span>Мотоцикли</span>
              <ChevronRight size={18} className={`mobile-cat-arrow ${openSubmenu === 'moto' ? 'open' : ''}`} />
            </button>
            {openSubmenu === 'moto' && (
              <div className="mobile-submenu">
                <Link to="/moto" onClick={closeMenu} className="mobile-submenu-all">Всі мотоцикли</Link>
                {['Sport', 'Cruiser', 'Adventure', 'Scooter', 'Naked', 'Enduro', 'Motocross'].map(t => (
                  <Link key={t} to={`/moto?type=${t}`} onClick={closeMenu}>{t}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Екіпірування */}
          <div className="mobile-cat-item">
            <button className="mobile-cat-btn" onClick={() => setOpenSubmenu(openSubmenu === 'equip' ? null : 'equip')}>
              <span>Екіпірування</span>
              <ChevronRight size={18} className={`mobile-cat-arrow ${openSubmenu === 'equip' ? 'open' : ''}`} />
            </button>
            {openSubmenu === 'equip' && (
              <div className="mobile-submenu">
                <Link to="/equipment" onClick={closeMenu} className="mobile-submenu-all">Все екіпірування</Link>
                {['Шоломи', 'Куртки', 'Рукавички', 'Мотовзуття', 'Мотоштани', 'Комбінезони', 'Окуляри', 'Наколінники'].map(t => (
                  <Link key={t} to={`/equipment?type=${t}`} onClick={closeMenu}>{t}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Запчастини */}
          <div className="mobile-cat-item">
            <button className="mobile-cat-btn" onClick={() => setOpenSubmenu(openSubmenu === 'comp' ? null : 'comp')}>
              <span>Запчастини</span>
              <ChevronRight size={18} className={`mobile-cat-arrow ${openSubmenu === 'comp' ? 'open' : ''}`} />
            </button>
            {openSubmenu === 'comp' && (
              <div className="mobile-submenu">
                <Link to="/components" onClick={closeMenu} className="mobile-submenu-all">Всі запчастини</Link>
                {[['Двигун', 'Двигун'], ['Трансмісія', 'Трансмісія'], ['Гальмівна система', 'Гальма'], ['Електросистема', 'Електроніка']].map(([type, label]) => (
                  <Link key={type} to={`/components?type=${type}`} onClick={closeMenu}>{label}</Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

    </header>
  );
};

export default Header;
