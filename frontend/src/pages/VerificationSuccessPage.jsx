import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import '../styles/RegisterPage.css';

const VerificationSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      window.dispatchEvent(new Event('authUpdated'));
    }
  }, [token]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="register-container">
      <div className="register-card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <CheckCircle2 size={80} color="#4ade80" />
        </div>
        <h1 className="register-title">Успіх!</h1>
        <p style={{ color: 'var(--text)', fontSize: '1.2rem', margin: '20px 0', lineHeight: '1.6' }}>
          Ваш емейл успішно підтверджено! <br />
          Тепер ви можете користуватися всіма можливостями MotoCountry.
        </p>
        <button onClick={handleGoHome} className="register-button" style={{ marginTop: '10px' }}>
          Перейти на головну
        </button>
      </div>
    </div>
  );
};

export default VerificationSuccessPage;
