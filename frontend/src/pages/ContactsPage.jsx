import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ContactsPage.css';

const ContactsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Повідомлення успішно відправлено!');
        navigate('/'); // Redirect to home page
      } else {
        const data = await response.json();
        alert(`Помилка: ${data.error || 'Щось пішло не так'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacts-container">
      <div className="contacts-content">
        <h1 className="contacts-title">Контакти</h1>
        
        <div className="contacts-wrapper">
          <div className="contacts-info">
            <h2 className="info-subtitle">Зв'яжіться з нами</h2>
            <p className="info-description">
              Маєте запитання щодо вибору мотоцикла або екіпірування? Наша команда професіоналів 
              готова допомогти вам у будь-який час у межах робочого графіка.
            </p>

            <div className="contact-items">
              <div className="contact-item">
                <div className="item-icon">📞</div>
                <div className="item-details">
                  <h4>Телефон</h4>
                  <p>+38 (096) 277-91-24</p>
                  <p>+38 (063) 969-46-53</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="item-icon">✉️</div>
                <div className="item-details">
                  <h4>Email</h4>
                  <p>motocountry.store@gmail.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="item-icon">🕒</div>
                <div className="item-details">
                  <h4>Графік роботи</h4>
                  <p>Пн–Пт: 09:00 – 18:00</p>
                  <p>Сб–Нд: Вихідний</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contacts-form-card">
            <h3>Потрібна консультація?</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Ваше ім'я" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-row">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-row">
                <textarea 
                  name="message"
                  placeholder="Ваше повідомлення" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Надсилається...' : 'Відправити повідомлення'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
