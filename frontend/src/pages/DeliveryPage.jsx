import React from 'react';
import '../styles/DeliveryPage.css';

const DeliveryPage = () => {
  return (
    <div className="delivery-container">
      <div className="delivery-content">
        <h1 className="delivery-title">Доставка і оплата</h1>
        
        <section className="delivery-section">
          <p className="intro-text">
            Наш мотомагазин здійснює доставку замовлень по всій території України та за кордон, 
            забезпечуючи надійне пакування продукції та швидку передачу товарів до служб перевезення. 
            Після оформлення замовлення менеджер зв’язується з клієнтом для підтвердження деталей доставки, 
            уточнення наявності товару та погодження способу оплати. Відправлення здійснюється протягом 
            одного робочого дня після підтвердження замовлення або отримання оплати.
          </p>
        </section>

        <div className="delivery-grid">
          <div className="delivery-card">
            <div className="card-icon">📦</div>
            <h3>Нова пошта</h3>
            <p>
              Дозволяє швидко отримати замовлення у відділенні, поштоматі або за допомогою адресної кур’єрської доставки. 
              Термін транспортування: 1-3 робочих дні. Після відправлення ви отримаєте номер накладної для відстеження.
            </p>
          </div>

          <div className="delivery-card">
            <div className="card-icon">✉️</div>
            <h3>Укрпошта</h3>
            <p>
              Доступний і економний спосіб отримання товарів у будь-якому регіоні України. Посилки доставляються 
              до відділення або за адресою. Термін доставки: 3-5 робочих днів.
            </p>
          </div>

          <div className="delivery-card">
            <div className="card-icon">🌍</div>
            <h3>Meest</h3>
            <p>
              Забезпечує перевезення по Україні та міжнародні відправлення до Європи, США та інших регіонів. 
              Зручно для замовлень за кордон.
            </p>
          </div>

          <div className="delivery-card">
            <div className="card-icon">✈️</div>
            <h3>DHL & FedEx</h3>
            <p>
              Швидке транспортування замовлень до більшості країн світу. Термін доставки залежить від країни 
              призначення та обраного тарифу перевізника.
            </p>
          </div>
        </div>

        <section className="payment-section">
          <h2 className="section-title">Оплата</h2>
          <div className="payment-methods">
            <div className="payment-method">
              <span className="dot-icon"></span>
              <p>Банківською карткою під час оформлення покупки на сайті.</p>
            </div>
            <div className="payment-method">
              <span className="dot-icon"></span>
              <p>Післяплатою при отриманні товару у відділенні служби доставки по Україні.</p>
            </div>
            <div className="payment-method">
              <span className="dot-icon"></span>
              <p>Безготівковим переказом для юридичних осіб.</p>
            </div>
            <div className="payment-method">
              <span className="dot-icon"></span>
              <p>Для міжнародних замовлень зазвичай застосовується повна передоплата.</p>
            </div>
          </div>
          <p className="security-note">
            Усі платежі здійснюються із дотриманням сучасних стандартів безпеки та захисту персональних даних клієнтів.
          </p>
        </section>
      </div>
    </div>
  );
};

export default DeliveryPage;
