import React, { useState, useEffect } from 'react';
import './MotorcycleCard.css'; // Reuse common card styles

const ProductCard = ({ id, image, type, model, price, details, category }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCart, setIsCart] = useState(false);

  useEffect(() => {
    const checkCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setIsCart(cart.some(item => String(item.id) === String(id)));
    };
    checkCart();

    window.addEventListener('cartUpdated', checkCart);
    return () => window.removeEventListener('cartUpdated', checkCart);
  }, [id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    let userId = null;

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      userId = user.id;
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }

    if (!token || !userId) {
      alert('Будь ласка, увійдіть в акаунт, щоб додавати товари в корзину');
      return;
    }

    try {
      let res;
      if (isCart) {
        // Find the cart item ID from localStorage if possible, or use simple DELETE if supported
        // The backend expects cart_item_id, but here 'id' is product_id.
        // Let's check how removeCartItemController works.
        res = await fetch(`/api/cart-items/remove-item-by-product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, prodId: id, category: category })
        });
      } else {
        res = await fetch('/api/cart-items/add-item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, prodId: id, category: category })
        });
      }

      if (res.ok) {
        const newCartState = !isCart;
        setIsCart(newCartState);

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (newCartState) {
          cart.push({ id, image, type, model, price, details, category, quantity: 1 });
        } else {
          cart = cart.filter(item => String(item.id) !== String(id));
        }
        localStorage.setItem('cart', JSON.stringify(cart));

        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  useEffect(() => {
    const checkFavorite = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setIsFavorite(favorites.some(fav => String(fav.id) === String(id)));
    };
    checkFavorite();

    window.addEventListener('favoritesUpdated', checkFavorite);
    return () => window.removeEventListener('favoritesUpdated', checkFavorite);
  }, [id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    let userId = null;

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      userId = user.id;
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }

    if (!token || !userId) {
      alert('Будь ласка, увійдіть в акаунт, щоб додавати товари в обране');
      return;
    }

    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, prodId: id, category: category }) // Added category
      });

      if (res.ok) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);

        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (newFavoriteState) {
          favorites.push({ id, image, type, model, price, details, category });
        } else {
          favorites = favorites.filter(fav => String(fav.id) !== String(id));
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));

        window.dispatchEvent(new Event('favoritesUpdated'));
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  return (
    <div className="moto-card-wrapper">
      <div className="moto-card">
        <div className="moto-card-image">
          <img src={image} alt={model} />
        </div>
        <div className="moto-card-content">
          <div className="moto-card-type">{type}</div>
          <div className="moto-card-model">{model}</div>
          <div className="moto-card-price">{price}</div>
          <div className="moto-card-details">
            {details && details.map((detail, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">{detail.label}:</span>
                <span className="value">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="moto-card-actions">
          <button
            className={`add-to-cart-btn ${isCart ? 'active' : ''}`}
            aria-label={isCart ? "Видалити з корзини" : "Додати в корзину"}
            onClick={handleAddToCart}>
            {isCart ? "Видалити з корзини" : "Додати в корзину"}
          </button>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? "Видалити з обраного" : "Додати в обране"}
            onClick={handleFavoriteClick}
          >
            <svg
              width="24" height="24" viewBox="0 0 24 24"
              fill={isFavorite ? "#ef4444" : "none"}
              stroke={isFavorite ? "#ef4444" : "currentColor"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
