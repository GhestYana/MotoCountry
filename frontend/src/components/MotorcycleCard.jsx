import React from 'react';
import './MotorcycleCard.css';

const MotorcycleCard = ({ image, type, model, price, volume }) => {
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
            <span className="label">Робочий об'єм:</span>
            <span className="value">{volume}</span>
          </div>
        </div>
        <div className="moto-card-actions">
          <button className="add-to-cart-btn">Додати в корзину</button>
          <button className="favorite-btn" aria-label="Add to favorites">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleCard;
