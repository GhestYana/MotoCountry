import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MotorcycleCard.css'; // Reuse common card styles

const ProductCard = ({ id, image, type, model, price, details, category, availability, average_rating }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCart, setIsCart] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${category}/${id}`);
  };

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

    const updateLocalStorage = (shouldAdd) => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (shouldAdd) {
        cart.push({ id, image, type, model, price, details, category, quantity: 1 });
      } else {
        cart = cart.filter(item => String(item.id) !== String(id));
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      setIsCart(shouldAdd);
      window.dispatchEvent(new Event('cartUpdated'));
    };

    if (!token || !userId) {
      // Guest mode: only localStorage
      updateLocalStorage(!isCart);
      return;
    }

    try {
      let res;
      if (isCart) {
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
        updateLocalStorage(!isCart);
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

    const updateLocalFavorites = (shouldAdd) => {
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      if (shouldAdd) {
        favorites.push({ id, image, type, model, price, details, category });
      } else {
        favorites = favorites.filter(fav => String(fav.id) !== String(id));
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(shouldAdd);
      window.dispatchEvent(new Event('favoritesUpdated'));
    };

    if (!token || !userId) {
      // Guest mode: only localStorage
      updateLocalFavorites(!isFavorite);
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
        updateLocalFavorites(!isFavorite);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  return (
    <div className="moto-card-wrapper">
      <div className="moto-card" onClick={handleCardClick}>
        <div className="moto-card-image">
          <img src={image} alt={model} />
        </div>
        <div className="moto-card-content">
          <div className="card-top-row">
            <div className="moto-card-type">{type}</div>
            <div className="card-rating-badge">
              <span className="star">★</span>
              <span className="val">{average_rating || '-'}</span>
            </div>
          </div>
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
          {availability && (() => {
            const statusMap = {
              'available': { text: 'В наявності', class: 'in' },
              'not available': { text: 'Немає в наявності', class: 'out' },
              'expected': { text: 'Очікується', class: 'expected' }
            };
            const status = statusMap[availability.toLowerCase()] || { text: availability, class: availability.toLowerCase().includes('не') ? 'out' : 'in' };
            return (
              <div className={`availability-text-row ${status.class}`}>
                <span className="status-dot"></span>
                {status.text}
              </div>
            );
          })()}
        </div>
        <div className="moto-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`add-to-cart-btn ${isCart ? 'in-cart' : ''} ${(!availability || availability.toLowerCase().includes('не') || availability.toLowerCase() === 'expected') ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!availability || availability.toLowerCase().includes('не') || availability.toLowerCase() === 'expected'}
          >
            {isCart ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Видалити з кошика
              </>
            ) : (!availability || availability.toLowerCase().includes('не') || availability.toLowerCase() === 'expected') ? (
              'Недоступно'
            ) : (
              'До кошика'
            )}
          </button>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
