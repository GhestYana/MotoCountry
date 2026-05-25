import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CartItemsPage.css';

const CartItemsPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mergeStarted = React.useRef(false);

  const getItemLabel = (item) => {
    return item.title || item.model || item.name || 'Товар';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=MotoCountry';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `/${imagePath}`;
  };

  const fetchCartItems = async () => {
    // 1. First, load from localStorage for immediate display (works for guests too)
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(localCart.map(item => ({
      ...item,
      // Ensure field consistency with what the UI expects
      cart_item_id: item.cart_item_id || item.id,
      title: item.title || item.model // ProductCard uses model, API uses title
    })));

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const itemsToMerge = localCart.filter(item => !item.cart_item_id);

    if (user && token && itemsToMerge.length > 0 && !mergeStarted.current) {
      mergeStarted.current = true;
      console.log("Merging guest cart items to server...");
      try {
        await Promise.all(itemsToMerge.map(item =>
          fetch('/api/cart-items/add-item', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.id,
              prodId: item.id,
              category: item.category,
              quantity: item.quantity || 1
            })
          })
        ));
        // Only clear what we merged or clear all if successful
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {
        console.error("Failed to migrate guest cart:", err);
      }
    }

    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/cart-items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // Clear ghost cart
        setCartItems([]);
        window.dispatchEvent(new Event('authUpdated'));
        window.dispatchEvent(new Event('cartUpdated'));
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Map API data to our unified format
      const normalizedData = data.map(item => ({
        id: item.product_id,
        cart_item_id: item.cart_item_id,
        quantity: item.quantity,
        category: item.category,
        title: item.title,
        price: item.price,
        image: item.image,
        brand: item.brand,
        average_rating: item.average_rating
      }));

      setCartItems(normalizedData);

      // Sync localStorage with fresh server data
      localStorage.setItem('cart', JSON.stringify(normalizedData));
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (err) {
      console.error("Error fetching cart:", err);
      // If we can't reach the server, we keep showing the local cart 
      // but only if it's not a 401 error.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();

    // Listen for changes from other tabs/components
    const handleSync = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(updatedCart);
    };

    window.addEventListener('cartUpdated', handleSync);
    return () => window.removeEventListener('cartUpdated', handleSync);
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    // 1. Update localStorage and UI immediately for snappy response
    const newItems = cartItems.map(item =>
      String(item.cart_item_id) === String(cartItemId) ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));

    // 2. If logged in, sync with server
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/api/cart-items/update-item/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
    } catch (err) {
      console.error("Помилка оновлення кількості на сервері:", err);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    const itemToRemove = cartItems.find(item => item.cart_item_id === cartItemId);

    // 1. Update localStorage and UI immediately
    const newItems = cartItems.filter(item => String(item.cart_item_id) !== String(cartItemId));
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));

    // 2. If logged in, sync with server
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/api/cart-items/remove-item/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Помилка видалення товару на сервері:", err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Extract numeric value from string (e.g., "19500 грн" -> 19500)
      const numericPrice = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^\d.]/g, ''))
        : item.price;

      return total + (numericPrice || 0) * item.quantity;
    }, 0);
  };

  if (loading) return <div className="cart-status">Завантаження...</div>;
  if (error) return <div className="cart-status error">{error}</div>;

  return (
    <div className="cart-items-container">
      <h1 className="cart-title">Ваша Корзина</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Ваша корзина порожня</p>
          <button className="continue-shopping" onClick={() => window.location.href = '/'}>
            Перейти до покупок
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.cart_item_id || item.id} className="cart-item-row">
                <div className="item-img-container">
                  <img src={getImageUrl(item.image)} alt={getItemLabel(item)} />
                </div>

                <div className="item-name-cell">
                  {getItemLabel(item)}
                </div>

                <div className="quantity-cell">
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="price-cell">
                  {(() => {
                    const numeric = typeof item.price === 'string'
                      ? parseFloat(item.price.replace(/[^\d.]/g, ''))
                      : item.price;
                    return (numeric || 0).toLocaleString('uk-UA', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }).replace(',', '.') + ' ₴';
                  })()}
                </div>

                <div className="remove-cell">
                  <button className="delete-btn" onClick={() => handleRemoveItem(item.cart_item_id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Підсумок замовлення</h2>
            <div className="summary-row">
              <span>Товари ({cartItems.length}):</span>
              <span>{calculateTotal().toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} ₴</span>
            </div>
            <div className="summary-row total">
              <span>Разом:</span>
              <span>{calculateTotal().toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} ₴</span>
            </div>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>Оформити замовлення</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartItemsPage;