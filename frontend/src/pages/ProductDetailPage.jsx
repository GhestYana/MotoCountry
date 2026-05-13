import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCart, setIsCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?.id;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`/api/reviews/product/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) {
          console.warn('Reviews not loaded:', res.status);
          return;
        }

        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviews();
  }, [id]);

  const handleEditStart = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
  };

  const handleEditSave = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/reviews/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reviewId, rating: editRating, text: editText })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, rating: editRating, text: editText } : r));
        setEditingReviewId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/reviews/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reviewId })
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      }
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let endpoint = '';
        if (category === 'motorcycles' || category === 'motorcycle') endpoint = `/api/motorcycles/${id}`;
        else if (category === 'equipment') endpoint = `/api/equipment/${id}`;
        else if (category === 'components' || category === 'component') endpoint = `/api/components/${id}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [category, id]);

  useEffect(() => {
    const checkStatus = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setIsCart(cart.some(item => String(item.id) === String(id)));
      setIsFavorite(favorites.some(fav => String(fav.id) === String(id)));
    };
    checkStatus();
    window.addEventListener('cartUpdated', checkStatus);
    window.addEventListener('favoritesUpdated', checkStatus);
    return () => {
      window.removeEventListener('cartUpdated', checkStatus);
      window.removeEventListener('favoritesUpdated', checkStatus);
    };
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    const updateLocal = (shouldAdd) => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (shouldAdd) {
        cart.push({
          id: product.id,
          image: product.image,
          type: product.type,
          model: product.name,
          price: product.price,
          category: category,
          quantity: 1
        });
      } else {
        cart = cart.filter(item => String(item.id) !== String(id));
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    };

    if (!token || !userId) {
      updateLocal(!isCart);
      return;
    }

    try {
      const endpoint = isCart ? '/api/cart-items/remove-item-by-product' : '/api/cart-items/add-item';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId, prodId: id, category: category })
      });
      if (res.ok) updateLocal(!isCart);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    const updateLocal = (shouldAdd) => {
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      if (shouldAdd) {
        favorites.push({
          id: product.id,
          image: product.image,
          type: product.type,
          model: product.name,
          price: product.price,
          category: category
        });
      } else {
        favorites = favorites.filter(fav => String(fav.id) !== String(id));
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      window.dispatchEvent(new Event('favoritesUpdated'));
    };

    if (!token || !userId) {
      updateLocal(!isFavorite);
      return;
    }

    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId, prodId: id, category: category })
      });
      if (res.ok) updateLocal(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="detail-loading">Завантаження...</div>;
  if (!product) return <div className="detail-error">Товар не знайдено</div>;

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Назад
      </button>

      <div className="product-detail-main">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-info">
          <span className="product-category-tag">{category}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-brand">{product.brand}</p>
          <div className="product-price-and-rating">
            <div className="product-price-large">{product.price} грн</div>
            <div className="product-average-rating">
              <span className="star-icon filled">★</span>
              <span className="rating-value">
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : "-"}
              </span>
              <span className="rating-count">({reviews.length})</span>
            </div>
          </div>

          {product.availability && (() => {
            const statusMap = {
              'available': { text: 'В наявності', class: 'in' },
              'not available': { text: 'Немає в наявності', class: 'out' },
              'expected': { text: 'Очікується', class: 'expected' }
            };
            const status = statusMap[product.availability.toLowerCase()] || { text: product.availability, class: product.availability.toLowerCase().includes('не') ? 'out' : 'in' };
            return (
              <div className={`detail-availability ${status.class}`}>
                <span className="status-dot"></span>
                {status.text}
              </div>
            );
          })()}

          <div className="product-actions-row">
            <button
              className={`action-btn-main cart ${isCart ? 'active' : ''} ${(!product.availability || product.availability.toLowerCase().includes('не') || product.availability.toLowerCase() === 'expected') ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!product.availability || product.availability.toLowerCase().includes('не') || product.availability.toLowerCase() === 'expected'}
            >
              {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg> */}
              {isCart ? ' Видалити з кошика' : (!product.availability || product.availability.toLowerCase().includes('не') || product.availability.toLowerCase() === 'expected') ? 'Недоступно' : 'До кошика'}
            </button>
            <button
              className={`action-btn-main fav ${isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div className="product-description-box">
            <h3>Опис</h3>
            <p>{product.description || 'Опис відсутній для цього товару.'}</p>
          </div>

          <div className="product-specs-grid">
            <h3>Характеристики</h3>
            <div className="specs-list">
              {Object.entries({
                brand: "Бренд",
                type: "Тип",
                color: "Колір",
                year: "Рік випуску",
                engine_displacement: "Об'єм двигуна (см³)",
                power: "Потужність (к.с.)",
                speed: "Макс. швидкість (км/год)",
                fuel_consumption: "Розхід палива (л/100км)",
                tank_capacity: "Об'єм бака (л)",
                weight: "Вага (кг)",
                length: "Довжина (мм)",
                width: "Ширина (мм)",
                height: "Висота (мм)",
                tire_diameter: "Діаметр шин (дюйм)",
                suspension: "Підвіска",
                brake_system: "Гальмівна система",
                material: "Матеріал",
                size: "Розмір",
                parameters: "Параметри"
              }).map(([key, label]) => {
                const value = product[key];
                if (value === undefined || value === null || value === '') return null;

                return (
                  <div className="spec-item" key={key}>
                    <span className="spec-label">{label}:</span>
                    <span className="spec-value">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="review-section">
            <div className="review-section-header">
              <h3>Відгуки</h3>
              <button
                className="add-review-btn-minimal"
                onClick={() => navigate(`/review/add/${category}/${id}`)}
              >
                Додати відгук
              </button>
            </div>

            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <div className="review-card" key={r.id}>
                    {editingReviewId === r.id ? (
                      <div className="review-edit-mode">
                        <div className="review-rating-edit">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star-icon-selectable ${editRating >= star ? 'filled' : ''}`}
                              onClick={() => setEditRating(star)}
                            >★</span>
                          ))}
                        </div>
                        <textarea
                          className="review-textarea-edit"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="review-edit-actions">
                          <button className="confirm-btn" onClick={() => handleEditSave(r.id)}>Зберегти</button>
                          <button className="cancel-btn" onClick={handleEditCancel}>Відмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-card-header">
                          <div className="author-info">
                            <span className="review-author">{r.user_name || 'Анонім'}</span>
                            <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`star-icon ${i < r.rating ? 'filled' : ''}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="review-text">{r.text}</p>
                        {String(r.user_id) === String(currentUserId) && (
                          <div className="review-actions-minimal">
                            <button onClick={() => handleEditStart(r)}>Редагувати</button>
                            <button className="del-text" onClick={() => handleDeleteReview(r.id)}>Видалити</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-reviews">Відгуків ще немає. Будьте першим, хто залишить відгук!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
