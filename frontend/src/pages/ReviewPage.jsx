import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ReviewPage.css';

const ReviewPage = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCart, setIsCart] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/reviews/${reviewId}`);
      const data = await res.json();
      setReviews(data);
    };

    fetchReviews();
  }, [reviewId]);

  if (loading) return <div className="loading">Завантаження...</div>;
  if (!reviews) return <div className="error">Відгук не знайдено</div>;

  return (
    <div className="review-page">
      <div className="review-container">

        <div className="review-header">
          <h1>{reviews.title}</h1>
          <p>{reviews.rating}</p>
          <p>{reviews.text}</p>
          <p>{reviews.created_at}</p>
          <p>{reviews.updated_at}</p>
          <p>{reviews.user_id}</p>
          <p>{reviews.product_id}</p>
          {/* <p>{reviews.category}</p>
          <p>{reviews.image}</p>
          <p>{reviews.brand}</p>
          <p>{reviews.price}</p>
          <p>{reviews.availability}</p>
          <p>{reviews.description}</p>
          <p>{reviews.category}</p>
          <p>{reviews.category}</p> */}
          <button onClick={() => navigate(`/product/${reviews.motorcycle_id || reviews.equipment_id || reviews.component_id}`)}>Переглянути товар</button>
        </div>
      </div>
    </div>

  );
};
