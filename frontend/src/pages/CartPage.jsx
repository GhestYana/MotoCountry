import React, { useState, useEffect } from 'react';
import '../styles/CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getItemLabel = (item) => {
    const title = item.name || item.title || item.model || 'Товар';
    const cat = (item.category || '').toLowerCase();

    if (cat.includes('motorcycle')) return title;
    if (cat.includes('equipment')) {
      return item.size ? `${item.size} ${title}` : title;
    }
    if (cat.includes('component')) return title;

    return title;
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

    if (user && token && localCart.length > 0) {
      // Automatic merge: if we're logged in but have local items, migrate them to DB
      console.log("Merging local cart to server...");
      try {
        await Promise.all(localCart.map(item => 
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
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        // Continue to fetch fresh combined data from server
      } catch (err) {
        console.error("Failed to migrate local cart:", err);
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
        category: item.type,
        title: item.title,
        price: item.price,
        image: item.image,
        brand: item.brand
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
    setCartItems(prev => {
      const newItems = prev.map(item =>
        String(item.cart_item_id) === String(cartItemId) ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return newItems;
    });

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
    setCartItems(prev => {
      const newItems = prev.filter(item => String(item.cart_item_id) !== String(cartItemId));
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return newItems;
    });

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
                  <img src={item.image || 'https://via.placeholder.com/300x200?text=Product'} alt={item.name || item.model || 'Product'} />
                </div>

                <div className="item-name-cell">
                  {getItemLabel(item)}
                </div>

                <div className="quantity-cell">
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                  >
                    -
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
                  {typeof item.price === 'string' 
                    ? item.price.replace('грн', '').trim() 
                    : item.price.toLocaleString()} грн
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