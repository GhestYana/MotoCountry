import React, { useState, useEffect } from 'react';
import '../styles/CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getItemLabel = (item) => {
    switch (item.category) {
      case 'motorcycles':
        return item.title;

      case 'equipment':
        return item.size ? `${item.size} ${item.title}` : item.title;

      case 'components':
        return item.title;

      default:
        return item.name;
    }
  };

  const fetchCartItems = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(" Не вдалося завантажити кошик:", errorText);
        setCartItems([]);
        return;
      }

      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/cart-items/update-item/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (res.ok) {
        setCartItems(prev => prev.map(item =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (err) {
      console.error("Помилка оновлення кількості:", err);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    const token = localStorage.getItem('token');
    const itemToRemove = cartItems.find(item => item.cart_item_id === cartItemId);

    try {
      const res = await fetch(`/api/cart-items/remove-item/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.cart_item_id !== cartItemId));

        // Synchronize with localStorage
        if (itemToRemove) {
          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          cart = cart.filter(cartItem => cartItem.id !== itemToRemove.id);
          localStorage.setItem('cart', JSON.stringify(cart));
        }

        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error("Помилка видалення товару:", err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  };

  if (loading) return <div className="cart-status">Завантаження...</div>;
  if (error) return <div className="cart-status error">{error}</div>;

  return (
    <div className="cart-container">
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
              <div key={item.cart_item_id} className="cart-item-row">
                <div className="item-img-container">
                  <img src={item.image || 'https://via.placeholder.com/300x200?text=Product'} alt={item.name} />
                </div>

                <div className="item-name-cell">
                  {getItemLabel(item)}
                </div>

                <div className="quantity-cell">
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                  >
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="remove-cell">
                  <button className="delete-btn" onClick={() => handleRemoveItem(item.cart_item_id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div className="price-cell">
                  {item.price.toLocaleString()} грн
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Підсумок замовлення</h2>
            <div className="summary-row">
              <span>Товари ({cartItems.length}):</span>
              <span>{calculateTotal().toLocaleString()} ₴</span>
            </div>
            <div className="summary-row total">
              <span>Разом:</span>
              <span>{calculateTotal().toLocaleString()} ₴</span>
            </div>
            <button className="checkout-btn">Оформити замовлення</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;