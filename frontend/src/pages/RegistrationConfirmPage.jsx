import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RegisterPage.css'; // Reusing some base styles

const RegistrationConfirmPage = () => {
  return (
    <div className="register-container">
      <div className="register-card" style={{ textAlign: 'center' }}>
        <h1 className="register-title" style={{ fontSize: '1.5rem' }}>Підтвердження</h1>
        <p style={{ color: '#fff', fontSize: '1.1rem', margin: '20px 0', lineHeight: '1.6' }}>
          Вам на емейл надіслано лист для підтвердження реєстрації.
        </p>
        <Link to="/login" className="register-button" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '10px' }}>
          Повернутися до входу
        </Link>
      </div>
    </div>
  );
};

export default RegistrationConfirmPage;
