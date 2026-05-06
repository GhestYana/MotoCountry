import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/MotoPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          console.error(" Не вдалося завантажити корзину:", errorText);
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

    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
              <ProductCard
                key={item.id}
                id={item.id}
                category={item.category}
                image={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                type={item.type}
                model={item.name}
                price={`${item.price} грн`}
                details={[
                  { label: "Бренд", value: item.brand }
                ]}
              />
            ))}
          </div>

          <div className="cart-summary">
            <h2>Підсумок замовлення</h2>
            <div className="summary-row">
              <span>Товари ({cartItems.length}):</span>
              <span>{calculateTotal()} ₴</span>
            </div>
            <div className="summary-row total">
              <span>Разом:</span>
              <span>{calculateTotal()} ₴</span>
            </div>
            <button className="checkout-btn">Оформити замовлення</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;