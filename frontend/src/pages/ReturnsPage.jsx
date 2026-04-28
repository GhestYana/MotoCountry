import React from 'react';
import '../styles/ReturnsPage.css';

const ReturnsPage = () => {
  return (
    <div className="returns-container">
      <div className="returns-content">
        <h1 className="returns-title">Повернення та обмін</h1>
        <section className="returns-hero">
          <p className="hero-text">
            Ми надаємо можливість повернення або обміну товару відповідно до законодавства України
            протягом <strong>14 календарних днів</strong> із моменту отримання замовлення.
          </p>
        </section>

        <div className="returns-info-grid">
          <div className="info-card">
            <div className="card-num">01</div>
            <h3>Умови повернення</h3>
            <p>
              Товар не використовувався, не має слідів експлуатації, збережено його товарний вигляд,
              комплектацію, упаковку та документи, що підтверджують покупку.
            </p>
          </div>

          <div className="info-card">
            <div className="card-num">02</div>
            <h3>Екіпірування</h3>
            <p>
              Особливо важливо, щоб екіпірування та аксесуари зберігали первинний стан без
              жодних пошкоджень або змін.
            </p>
          </div>

          <div className="info-card">
            <div className="card-num">03</div>
            <h3>Виробничий дефект</h3>
            <p>
              У випадку дефекту клієнт має право на безкоштовний обмін або повернення коштів.
              Витрати на пересилання компенсуються магазином.
            </p>
          </div>
        </div>

        <section className="procedure-section">
          <h2>Процедура повернення</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-circle">1</div>
              <div className="step-content">
                <h4>Звернення</h4>
                <p>Зв'яжіться зі службою підтримки магазину із зазначенням причини повернення.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-circle">2</div>
              <div className="step-content">
                <h4>Перевірка</h4>
                <p>Після отримання товару проводиться перевірка його стану (триває до 3 робочих днів).</p>
              </div>
            </div>

            <div className="step">
              <div className="step-circle">3</div>
              <div className="step-content">
                <h4>Повернення коштів</h4>
                <p>Кошти повертаються тим самим способом, яким було виконано оплату, протягом кількох банківських днів.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="returns-footer">
          <p>
            Ми завжди намагаємося зробити процес повернення максимально швидким і зручним для клієнтів,
            забезпечуючи прозорі умови співпраці та якісний сервіс.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnsPage;
