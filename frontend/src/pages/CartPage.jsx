import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openLiqPayCheckout } from '../utils/liqpayCheckout';
import { CreditCard, Smartphone, Banknote, Landmark, Info } from 'lucide-react';
import novapostLogo from '../data/novapost.png';
import ukrpostaLogo from '../data/ukrposta.png';
import meestLogo from '../data/meest.png';
import dhlLogo from '../data/dhl.png';
import fedexLogo from '../data/fedEx.png';
import '../styles/CartPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        city: '',
        cityRef: '',
        delivery: 'Нова Пошта',
        address: '',
        branch: '',
        branchRef: '',
        postalCode: '',
        paymentMethod: 'card',
        comment: ''
    });

    const [cities, setCities] = useState([]);
    const [branches, setBranches] = useState([]);
    const [showCityResults, setShowCityResults] = useState(false);
    const [showBranchResults, setShowBranchResults] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);

    useEffect(() => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(localCart);

        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'city') {
            if (value.length > 2) {
                searchCities(value);
            } else {
                setCities([]);
                setShowCityResults(false);
            }
        }

        if (name === 'branch') {
            setShowBranchResults(true);
        }
    };

    const searchCities = async (val) => {
        setLoadingCities(true);
        try {
            const res = await fetch(`/api/delivery/cities?search=${val}&service=${formData.delivery}`);
            if (res.ok) {
                const data = await res.json();
                setCities(data);
                setShowCityResults(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCities(false);
        }
    };

    const selectCity = (city) => {
        setFormData(prev => ({
            ...prev,
            city: city.name,
            cityRef: city.id,
            branch: '',
            branchRef: ''
        }));
        setCities([]);
        setShowCityResults(false);
        fetchBranches(city.id, formData.delivery);
    };

    const fetchBranches = async (cityRef, delivery) => {
        setLoadingBranches(true);
        setBranches([]);
        try {
            const res = await fetch(`/api/delivery/branches?cityRef=${encodeURIComponent(cityRef)}&service=${encodeURIComponent(delivery)}`);
            if (res.ok) {
                const data = await res.json();
                setBranches(data);
                if (data.length > 0) setShowBranchResults(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingBranches(false);
        }
    };

    const selectBranch = (branch) => {
        setFormData(prev => ({
            ...prev,
            branch: branch.name,
            branchRef: branch.id
        }));
        setShowBranchResults(false);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const numericPrice = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/[^\d.]/g, ''))
                : item.price;
            return total + (numericPrice || 0) * (item.quantity || 1);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        const orderData = {
            userId: user ? user.id : null,
            ...formData,
            paymentMethod: formData.paymentMethod === 'gpay' ? 'card' : formData.paymentMethod,
            paytypes: formData.paymentMethod === 'gpay' ? 'gpay' : null,
            totalPrice: calculateTotal(),
            items: cartItems
        };

        try {
            const res = await fetch('/api/cart/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(orderData)
            });

            const result = await res.json();
            if (res.ok) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cartUpdated'));

                if (result.paymentData?.data && result.paymentData?.signature) {
                    try {
                        const payment = await openLiqPayCheckout(result.paymentData);
                        if (payment.status === 'success' || payment.status === 'sandbox') {
                            await fetch('/api/cart/payment-confirm', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: result.orderId, status: payment.status }),
                            });
                            navigate('/cart-items');
                        } else {
                            navigate('/cart-items');
                        }
                    } catch (payError) {
                        alert('Помилка оплати');
                    }
                } else {
                    alert('Замовлення оформлено!');
                    navigate('/');
                }
            } else {
                alert('Помилка: ' + (result.message || 'Спробуйте пізніше.'));
            }
        } catch (error) {
            alert('Помилка сервера');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-container empty">
                <h2>Ваша корзина порожня</h2>
                <button onClick={() => navigate('/moto')}>До товарів</button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <h1>Оформлення замовлення</h1>
                    <button className="back-btn" onClick={() => navigate('/cart-items')}>
                        ← Повернутися до кошика
                    </button>
                </header>

                <form className="checkout-content" onSubmit={handleSubmit}>
                    <div className="form-sections">
                        <section className="checkout-section">
                            <h3><span className="step-num">1</span> Контактні дані</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ім'я</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ваше ім'я" />
                                </div>
                                <div className="form-group">
                                    <label>Прізвище</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ваше прізвище" />
                                </div>
                                <div className="form-group">
                                    <label>Телефон</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+380..." />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" />
                                </div>
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h3><span className="step-num">2</span> Доставка</h3>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Поштова служба</label>
                                    <div className="delivery-service-grid">
                                        {[
                                            { value: 'Нова Пошта', label: 'Нова Пошта', logo: novapostLogo },
                                            { value: 'Укрпошта', label: 'Укрпошта', logo: ukrpostaLogo },
                                            { value: 'Meest', label: 'Meest', logo: meestLogo },
                                            { value: 'DHL', label: 'DHL', logo: dhlLogo },
                                            { value: 'FedEx', label: 'FedEx', logo: fedexLogo },
                                        ].map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                className={`delivery-service-btn ${formData.delivery === s.value ? 'active' : ''}`}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, delivery: s.value, city: '', cityRef: '', branch: '', branchRef: '' }));
                                                    setBranches([]);
                                                    setCities([]);
                                                }}
                                            >
                                                <img src={s.logo} alt={s.label} className="service-logo" />
                                                <span className="service-label">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* DHL / FedEx — тільки ручний ввід */}
                                {(formData.delivery === 'DHL' || formData.delivery === 'FedEx') ? (
                                    <>
                                        <div className="form-group">
                                            <label>Країна</label>
                                            <input
                                                required
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Наприклад: Польща, Німеччина..."
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Поштовий індекс</label>
                                            <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="01001" />
                                        </div>
                                        <div className="form-group full">
                                            <label>Повна адреса доставки</label>
                                            <input
                                                required
                                                name="branch"
                                                value={formData.branch}
                                                onChange={handleChange}
                                                placeholder="Місто, вулиця, будинок..."
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="form-group full">
                                            <p className="delivery-note">
                                                <Info size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                                {formData.delivery === 'DHL'
                                                    ? 'Для DHL вкажіть повну міжнародну адресу. Менеджер зв\'яжеться з вами для уточнення деталей.'
                                                    : 'Для FedEx вкажіть повну міжнародну адресу. Менеджер зв\'яжеться з вами для уточнення деталей.'}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group city-group">
                                            <label>Місто</label>
                                            <div className="search-input-wrapper">
                                                <input
                                                    required
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="Почніть вводити назву..."
                                                    autoComplete="off"
                                                />
                                                {loadingCities && <span className="input-loader"></span>}
                                            </div>
                                            {showCityResults && cities.length > 0 && (
                                                <ul className="search-results-list">
                                                    {cities.map(city => (
                                                        <li key={city.id} onClick={() => selectCity(city)}>
                                                            <span>{city.name}</span>
                                                            {city.region && <span className="city-region">{city.region}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>Поштовий індекс</label>
                                            <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="01001" />
                                        </div>
                                        <div className="form-group full branch-group">
                                            <label>
                                                {formData.delivery === 'Meest' && !formData.cityRef
                                                    ? 'Відділення / Адреса'
                                                    : 'Відділення'}
                                            </label>
                                            <div className="search-input-wrapper">
                                                <input
                                                    required
                                                    name="branch"
                                                    value={formData.branch}
                                                    onChange={handleChange}
                                                    onClick={() => branches.length > 0 && setShowBranchResults(true)}
                                                    placeholder={
                                                        loadingBranches
                                                            ? 'Завантаження відділень...'
                                                            : formData.cityRef
                                                                ? 'Оберіть або введіть відділення...'
                                                                : 'Спочатку оберіть місто'
                                                    }
                                                    autoComplete="off"
                                                />
                                                {loadingBranches && <span className="input-loader"></span>}
                                            </div>
                                            {showBranchResults && branches.length > 0 && (
                                                <ul className="search-results-list">
                                                    {branches
                                                        .filter(b => b.name.toLowerCase().includes(formData.branch.toLowerCase()))
                                                        .map(branch => (
                                                            <li key={branch.id} onClick={() => selectBranch(branch)}>
                                                                <span>{branch.name}</span>
                                                                {branch.address && branch.address !== branch.name && (
                                                                    <span className="branch-address">{branch.address}</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h3><span className="step-num">3</span> Оплата</h3>
                            <div className="payment-options">
                                <label className={`payment-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} />
                                    <span className="pay-icon"><CreditCard size={20} /></span>
                                    <span className="pay-text">Картою онлайн</span>
                                </label>
                                <label className={`payment-card ${formData.paymentMethod === 'cash' ? 'active' : ''}`}>
                                    <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleChange} />
                                    <span className="pay-icon"><Banknote size={20} /></span>
                                    <span className="pay-text">При отриманні</span>
                                </label>
                                <label className={`payment-card ${formData.paymentMethod === 'installment' ? 'active' : ''}`}>
                                    <input type="radio" name="paymentMethod" value="installment" checked={formData.paymentMethod === 'installment'} onChange={handleChange} />
                                    <span className="pay-icon"><Landmark size={20} /></span>
                                    <span className="pay-text">Розстрочка</span>
                                </label>
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h3>Коментар до замовлення</h3>
                            <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Додаткові побажання..." rows="4"></textarea>
                        </section>
                    </div>

                    <aside className="order-summary-sidebar">
                        <div className="summary-card">
                            <h3>Ваше замовлення</h3>
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.cart_item_id || item.id} className="summary-item">
                                        <span className="item-name">{item.title || item.model} x{item.quantity}</span>
                                        <span className="item-price">
                                            {((typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price) * (item.quantity || 1)).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} ₴
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Доставка:</span>
                                    <span className="free">За тарифами перевізника</span>
                                </div>
                                <div className="total-row final">
                                    <span>Всього до оплати:</span>
                                    <span>{calculateTotal().toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} ₴</span>
                                </div>
                            </div>
                            <button type="submit" className="confirm-order-btn">Підтвердити замовлення</button>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;