import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { normalizeProductCategory } from '../utils/productCategory';
import {
  getFavorites,
  setFavorites,
  isProductFavorite,
  isAuthenticated,
} from '../utils/favoritesStorage';
import { useCurrency } from '../hooks/useCurrency';
import './MotorcycleCard.css';

const normalizeImage = (image) => {
  if (!image) return null;
  if (Array.isArray(image)) return image[0] || null;
  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1);
      const parts = inner.match(/(?:[^,"]+|"[^"]*")+/g) || [];
      const first = parts[0]?.replace(/^"|"$/g, '').trim();
      return first || null;
    }
    // TEXT колонка с несколькими URL через запятую
    if (trimmed.includes(',')) {
      return trimmed.split(',')[0].trim() || null;
    }
    return trimmed || null;
  }
  return null;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `/${imagePath}`;
};

const ProductCard = ({
  id,
  image,
  type,
  model,
  price,
  details,
  category,
  availability,
  average_rating
}) => {
  const { format } = useCurrency();
  const imageUrl = getImageUrl(normalizeImage(image));
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCart, setIsCart] = useState(false);
  const navigate = useNavigate();

  const normalizedCategory = useMemo(() => {
    return normalizeProductCategory(category);
  }, [category]);

  const handleCardClick = () => {
    navigate(`/product/${category}/${id}`);
  };

  // CART CHECK
  useEffect(() => {
    const checkCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setIsCart(cart.some(item => String(item.id) === String(id)));
    };

    checkCart();

    window.addEventListener('cartUpdated', checkCart);
    return () => window.removeEventListener('cartUpdated', checkCart);
  }, [id]);

  // FAVORITE CHECK
  useEffect(() => {
    const checkFavorite = () => {
      if (!normalizedCategory) return;
      setIsFavorite(isProductFavorite(id, normalizedCategory));
    };

    checkFavorite();

    window.addEventListener('favoritesUpdated', checkFavorite);
    window.addEventListener('authUpdated', checkFavorite);

    return () => {
      window.removeEventListener('favoritesUpdated', checkFavorite);
      window.removeEventListener('authUpdated', checkFavorite);
    };
  }, [id, normalizedCategory]);

  // CART HANDLER
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');

    const user = JSON.parse(localStorage.getItem('user'));
    let userId = user?.id;

    if (!userId && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }

    const updateLocalStorage = (shouldAdd) => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];

      if (shouldAdd) {
        const existingIndex = cart.findIndex(item => String(item.id) === String(id));

        if (existingIndex > -1) {
          cart[existingIndex].quantity =
            (cart[existingIndex].quantity || 0) + 1;
        } else {
          cart.push({ id, image: imageUrl, type, model, price, details, category, quantity: 1 });
        }
      } else {
        cart = cart.filter(item => String(item.id) !== String(id));
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      setIsCart(shouldAdd);
      window.dispatchEvent(new Event('cartUpdated'));
    };

    if (isCart) {
      if (!token || !userId) {
        updateLocalStorage(false);
        return;
      }

      try {
        const res = await fetch('/api/cart-items/remove-item-by-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userId, prodId: id, category })
        });

        if (res.ok) {
          updateLocalStorage(false);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }

      return;
    }

    if (!token || !userId) {
      updateLocalStorage(true);
      return;
    }

    try {
      const res = await fetch('/api/cart-items/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          prodId: id,
          category,
          quantity: 1
        })
      });

      if (res.ok) {
        setIsCart(true);

        const syncRes = await fetch('/api/cart-items', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (syncRes.ok) {
          const cartData = await syncRes.json();

          const normalizedData = cartData.map(item => ({
            id: item.product_id,
            cart_item_id: item.cart_item_id,
            quantity: item.quantity,
            category: item.category,
            title: item.title,
            price: item.price,
            image: item.image,
            brand: item.brand
          }));

          localStorage.setItem('cart', JSON.stringify(normalizedData));
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  // FAVORITE HANDLER
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!normalizedCategory) {
      console.error('Unknown category:', category);
      return;
    }

    const shouldAdd = !isFavorite;

    let favorites = getFavorites();

    if (shouldAdd) {
      favorites = [
        ...favorites.filter(fav =>
          String(fav.id) !== String(id) ||
          normalizeProductCategory(fav.category) !== normalizedCategory
        ),
        {
          id,
          image: imageUrl,
          type,
          model,
          name: model,
          price,
          details,
          category: normalizedCategory,
          availability,
          brand: details?.[0]?.value,
          average_rating,
        },
      ];
    } else {
      favorites = favorites.filter(fav =>
        String(fav.id) !== String(id) ||
        normalizeProductCategory(fav.category) !== normalizedCategory
      );
    }

    setFavorites(favorites);
    setIsFavorite(shouldAdd);
    window.dispatchEvent(new Event('favoritesUpdated'));

    if (!isAuthenticated()) return;

    const token = localStorage.getItem('token');

    try {
      const endpoint = shouldAdd
        ? '/api/favorites/add'
        : '/api/favorites/remove';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prodId: id,
          category: normalizedCategory,
        }),
      });

      if (!res.ok) {
        console.error('Favorite sync failed:', await res.text());
      }
    } catch (error) {
      console.error('Error syncing favorite:', error);
    }
  };

  return (
    <div className="moto-card-wrapper">
      <div className="moto-card" onClick={handleCardClick}>
        <div className="moto-card-image">
          <img src={imageUrl} alt={model} />
        </div>

        <div className="moto-card-content">
          <div className="card-top-row">
            <div className="moto-card-type">{type}</div>
            <div className="card-rating-badge">
              <Star size={14} className="star filled" fill="#ffc107" stroke="#ffc107" />
              <span className="val">{average_rating || '-'}</span>
            </div>
          </div>

          <div className="moto-card-model">{model}</div>
          <div className="moto-card-price">{format(price)}</div>

          <div className="moto-card-details">
            {details?.map((detail, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">{detail.label}:</span>
                <span className="value">{detail.value}</span>
              </div>
            ))}
          </div>

          {availability && (() => {
            const statusMap = {
              available: { text: 'В наявності', class: 'in' },
              'not available': { text: 'Немає в наявності', class: 'out' },
              expected: { text: 'Очікується', class: 'expected' }
            };

            const status =
              statusMap[availability.toLowerCase()] ||
              { text: availability, class: 'in' };

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
            className={`add-to-cart-btn ${isCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={!availability || availability.toLowerCase().includes('не') || availability.toLowerCase() === 'expected'}
          >
            {isCart ? 'Видалити з кошика' : 'До кошика'}
          </button>

          <button
            type="button"
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={isFavorite ? '#ef4444' : 'none'}
              stroke={isFavorite ? '#ef4444' : 'currentColor'}
              strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;