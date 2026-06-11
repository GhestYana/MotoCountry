import React, { useState, useEffect } from 'react';
import { onLogoutFavorites, syncFavoritesFromServer } from '../utils/favoritesStorage';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Package, MessageSquare, Bell, Settings, LogOut, CreditCard, Star, X, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/ProfilePage.css';

import { openLiqPayCheckout } from '../utils/liqpayCheckout';
import { useCurrency } from '../hooks/useCurrency';

const ProfilePage = () => {
    const { format } = useCurrency();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState({}); // { [orderId]: items[] }
    const [loadingItems, setLoadingItems] = useState({});
    const navigate = useNavigate();

    const handlePayNow = async (orderId, paytypes = null) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const url = `/api/orders/${orderId}/payment${paytypes ? `?paytypes=${paytypes}` : ''}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Помилка при отриманні даних для оплати');
                return;
            }

            const paymentData = await res.json();

            const payment = await openLiqPayCheckout(paymentData);

            if (payment.status === 'success' || payment.status === 'sandbox') {
                // Confirm payment on backend
                try {
                    await fetch('/api/cart/payment-confirm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: orderId,
                            status: payment.status,
                        }),
                    });
                    // Refresh data
                    fetchData(token);
                } catch (confirmErr) {
                    console.error('Payment confirm error:', confirmErr);
                }
            } else if (payment.status === 'failure' || payment.status === 'error') {
                alert('Оплата не пройшла. Спробуйте ще раз.');
            }
        } catch (error) {
            console.error('Pay now error:', error);
            alert('Сталася помилка при ініціалізації оплати.');
        }
    };

    const handleToggleOrderItems = async (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            return;
        }
        setExpandedOrderId(orderId);

        // Якщо вже завантажено — не запитуємо знову
        if (orderItems[orderId]) return;

        const token = localStorage.getItem('token');
        setLoadingItems(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`/api/orders/${orderId}/items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrderItems(prev => ({ ...prev, [orderId]: data }));
            }
        } catch (err) {
            console.error('Error fetching order items:', err);
        } finally {
            setLoadingItems(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const getDeletedNotificationsKey = () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        return `deletedNotifications_${storedUser?.id || 'guest'}`;
    };

    const getDeletedNotificationIds = () => {
        try {
            return JSON.parse(localStorage.getItem(getDeletedNotificationsKey())) || [];
        } catch {
            return [];
        }
    };

    const saveDeletedNotificationId = (notificationId) => {
        const deletedIds = getDeletedNotificationIds();
        const nextDeletedIds = [...new Set([...deletedIds, notificationId])];
        localStorage.setItem(getDeletedNotificationsKey(), JSON.stringify(nextDeletedIds));
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        setUser(storedUser);
        fetchData(token);
    }, [navigate]);

    const fetchData = async (token) => {
        setLoading(true);
        try {
            // Fetch Orders
            const orderRes = await fetch('/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (orderRes.ok) {
                const orderData = await orderRes.json();
                setOrders(orderData);
            }

            const favData = await syncFavoritesFromServer(token);
            setFavorites(favData);

            // Fetch Reviews
            const reviewRes = await fetch('/api/reviews/my-reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (reviewRes.ok) {
                const reviewData = await reviewRes.json();
                setReviews(reviewData);
            }

            const notificationRes = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (notificationRes.ok) {
                const notificationData = await notificationRes.json();
                const deletedIds = getDeletedNotificationIds().map(String);
                setNotifications(notificationData.filter((notification) => (
                    !deletedIds.includes(String(getNotificationId(notification)))
                )));
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const unreadNotificationsCount = notifications.filter((notification) => !notification.is_read).length;

    const getNotificationId = (notification) => notification.id ?? notification.notification_id;

    const handleNotificationsClick = async () => {
        setActiveTab('notifications');
        if (unreadNotificationsCount === 0) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        const token = localStorage.getItem('token');
        if (!token || notificationId == null) return;

        saveDeletedNotificationId(notificationId);
        setNotifications((prev) => prev.filter((notification) => getNotificationId(notification) !== notificationId));

        try {
            const res = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                console.error('Failed to delete notification:', await res.text());
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getStatusClass = (status) => {
        return `status-${status}`;
    };

    const translateStatus = (status) => {
        const translations = {
            'pending': 'Створено',
            'confirmed': 'Створено',
            'paid': 'Оплачено',
            'sent': 'Відправлено',
            'completed': 'Виконано',
            'collected': 'Зібрано',
            'returned': 'Повернено',
            'cancelled': 'Скасовано'
        };
        return translations[status] || status;
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        onLogoutFavorites();

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');

        window.dispatchEvent(new Event('authUpdated'));
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('favoritesUpdated'));
        navigate('/');
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>Особистий кабінет</h1>
            </header>
            {showLogoutConfirm && (
                <div className="profile-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="profile-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Вийти з профілю?</h3>
                        <p>Ви справді хочете завершити поточну сесію?</p>
                        <div className="profile-confirm-actions">
                            <button className="profile-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>
                                Скасувати
                            </button>
                            <button className="profile-confirm-logout" onClick={confirmLogout}>
                                Вийти
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="profile-layout">
                <aside className="profile-sidebar">
                    <div className="user-info-brief">
                        <h2>{user?.first_name} {user?.last_name}</h2>
                        <p>{user?.email}</p>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <Package size={18} /> Історія замовлень
                        </button>
                        <button
                            className={`profile-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            <MessageSquare size={18} /> Мої відгуки
                        </button>
                        <button
                            className={`profile-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={handleNotificationsClick}
                        >
                            <Bell size={18} /> Сповіщення
                            {unreadNotificationsCount > 0 && <span className="nav-badge">{unreadNotificationsCount}</span>}
                        </button>
                        {user?.role === 'admin' && (
                            <button className="profile-nav-btn" onClick={() => navigate('/admin')}>
                                <Settings size={18} /> Адмін-панель
                            </button>
                        )}
                        <button className="profile-nav-btn logout" onClick={handleLogout}>
                            <LogOut size={18} /> Вийти
                        </button>
                    </nav>
                </aside>

                <main className="profile-content">
                    {loading ? (
                        <div className="loading-spinner">Завантаження...</div>
                    ) : (
                        <>
                            {activeTab === 'orders' && (
                                <section className="orders-section">
                                    <h2>Мої замовлення</h2>
                                    {orders.length === 0 ? (
                                        <p className="no-data">У вас ще немає замовлень.</p>
                                    ) : (
                                        <div className="orders-list">
                                            {orders.map(order => (
                                                <div key={order.id} className="order-card">
                                                    <div className="order-header">
                                                        <div className="order-info">
                                                            <h3>Замовлення #{order.id.slice(0, 8)}</h3>
                                                            <span className="order-date">
                                                                {new Date(order.created_at).toLocaleDateString('uk-UA')}
                                                            </span>
                                                        </div>
                                                        <span className={`order-status ${getStatusClass(order.status)}`}>
                                                            {translateStatus(order.status)}
                                                        </span>
                                                    </div>
                                                    <div className="order-details-grid">
                                                        <div className="detail-item">
                                                            <span>Доставка:</span>
                                                            {order.delivery}, {order.city}
                                                        </div>
                                                        <div className="detail-item">
                                                            <span>Оплата:</span>
                                                            {order.payment_method === 'card' ? 'Картою онлайн' : 'При отриманні'}
                                                        </div>
                                                    </div>

                                                    {/* Товари замовлення */}
                                                    <button
                                                        className="order-items-toggle"
                                                        onClick={() => handleToggleOrderItems(order.id)}
                                                    >
                                                        {expandedOrderId === order.id
                                                            ? <><ChevronUp size={16} /> Сховати товари</>
                                                            : <><ChevronDown size={16} /> Переглянути товари</>
                                                        }
                                                    </button>

                                                    {expandedOrderId === order.id && (
                                                        <div className="order-items-list">
                                                            {loadingItems[order.id] ? (
                                                                <p className="order-items-loading">Завантаження...</p>
                                                            ) : (orderItems[order.id] || []).length === 0 ? (
                                                                <p className="order-items-loading">Товари не знайдено</p>
                                                            ) : (
                                                                (orderItems[order.id] || []).map(item => (
                                                                    <div
                                                                        key={item.cart_item_id}
                                                                        className="order-item-row"
                                                                        onClick={() => navigate(`/product/${item.category}/${item.product_id}`)}
                                                                    >
                                                                        <img
                                                                            src={item.image || 'https://via.placeholder.com/60x60?text=?'}
                                                                            alt={item.title}
                                                                            className="order-item-img"
                                                                        />
                                                                        <div className="order-item-info">
                                                                            <span className="order-item-title">{item.title}</span>
                                                                            <span className="order-item-brand">{item.brand}</span>
                                                                        </div>
                                                                        <div className="order-item-right">
                                                                            <span className="order-item-qty">× {item.quantity}</span>
                                                                            <span className="order-item-price">
                                                                                {format(Number(item.price) * item.quantity)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="order-footer-flex">
                                                        <div className="order-total-price">
                                                            {format(order.total_price)}
                                                        </div>
                                                        {order.status === 'pending' && order.payment_method === 'card' && (
                                                            <div className="order-pay-actions">
                                                                <button
                                                                    className="pay-now-btn"
                                                                    onClick={() => handlePayNow(order.id)}
                                                                >
                                                                    <CreditCard size={16} /> Оплатити
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {activeTab === 'favorites' && (
                                <section className="favorites-section">
                                    <h2>Обране</h2>
                                    {favorites.length === 0 ? (
                                        <p className="no-data">Ваш список обраного порожній.</p>
                                    ) : (
                                        <div className="wishlist-grid">
                                            {favorites.map(item => (
                                                <ProductCard
                                                    key={`${item.category}-${item.id}`}
                                                    id={item.id}
                                                    category={item.category}
                                                    model={item.name}
                                                    price={item.price}
                                                    image={item.image}
                                                    brand={item.brand}
                                                    availability={item.availability}
                                                    type={item.type}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {activeTab === 'reviews' && (
                                <section className="reviews-tab-section">
                                    <h2>Мої відгуки</h2>
                                    {reviews.length === 0 ? (
                                        <p className="no-data">Ви ще не залишили жодного відгуку.</p>
                                    ) : (
                                        <div className="profile-reviews-list">
                                            {reviews.map(review => (
                                                <div key={review.id} className="profile-review-card">
                                                    <div className="profile-review-header">
                                                        <div className="profile-review-product">
                                                            <h4 onClick={() => navigate(`/product/${review.category}/${review.motorcycle_id || review.equipment_id || review.component_id}`)}>
                                                                {review.product_name}
                                                            </h4>
                                                        </div>
                                                        <div className="profile-review-rating">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={16} className={`star ${i < review.rating ? 'filled' : ''}`} fill={i < review.rating ? "#ffc107" : "none"} stroke={i < review.rating ? "#ffc107" : "currentColor"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="profile-review-text">{review.text}</p>
                                                    <span className="profile-review-date">
                                                        {new Date(review.created_at).toLocaleDateString('uk-UA')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {activeTab === 'notifications' && (
                                <section className="notifications-tab-section">
                                    <h2>Уведомлення</h2>
                                    {notifications.length === 0 ? (
                                        <p className="no-data">У вас поки немає уведомлень.</p>
                                    ) : (
                                        <div className="profile-notifications-list">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={getNotificationId(notification)}
                                                    className={`profile-notification-card ${notification.is_read ? 'read' : 'unread'}`}
                                                >
                                                    <div className="profile-notification-content">
                                                        <p>{notification.message}</p>
                                                        <span>
                                                            {new Date(notification.created_at).toLocaleString('uk-UA')}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="profile-notification-delete"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteNotification(getNotificationId(notification));
                                                        }}
                                                        title="Видалити уведомлення"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
