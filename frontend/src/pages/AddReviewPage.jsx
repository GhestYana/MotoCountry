import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import '../styles/AddReviewPage.css';

const AddReviewPage = () => {
    const { category, id } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [canReview, setCanReview] = useState(null); // null = перевіряємо

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Завантажуємо товар і перевіряємо покупку паралельно
                let endpoint = '';
                if (category === 'motorcycles' || category === 'motorcycle') endpoint = `/api/motorcycles/${id}`;
                else if (category === 'equipment') endpoint = `/api/equipment/${id}`;
                else if (category === 'components' || category === 'component') endpoint = `/api/components/${id}`;

                const motorcycleId = (category === 'motorcycles' || category === 'motorcycle') ? id : null;
                const equipmentId = category === 'equipment' ? id : null;
                const componentId = (category === 'components' || category === 'component') ? id : null;

                const params = new URLSearchParams();
                if (motorcycleId) params.append('motorcycleId', motorcycleId);
                if (equipmentId) params.append('equipmentId', equipmentId);
                if (componentId) params.append('componentId', componentId);

                const [productRes, purchaseRes] = await Promise.all([
                    fetch(endpoint),
                    fetch(`/api/reviews/check-purchase?${params}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (!productRes.ok) throw new Error('Product not found');
                const productData = await productRes.json();
                setProduct(productData);

                if (purchaseRes.ok) {
                    const purchaseData = await purchaseRes.json();
                    setCanReview(purchaseData.purchased);
                } else {
                    setCanReview(false);
                }
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити дані про товар');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [category, id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!token || !userId) {
            alert('Будь ласка, увійдіть, щоб залишити відгук');
            navigate('/login');
            return;
        }

        const reviewData = {
            userId,
            rating,
            text,
            motorcycleId: (category === 'motorcycles' || category === 'motorcycle') ? id : null,
            equipmentId: category === 'equipment' ? id : null,
            componentId: (category === 'components' || category === 'component') ? id : null
        };

        try {
            const res = await fetch('/api/reviews/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });

            if (res.ok) {
                navigate(`/product/${category}/${id}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Помилка при додаванні відгуку');
            }
        } catch (err) {
            console.error(err);
            alert('Сталася помилка. Спробуйте пізніше.');
        }
    };

    if (loading) return <div className="loading-container">Завантаження...</div>;
    if (error) return <div className="error-container">{error}</div>;

    if (canReview === false) {
        return (
            <div className="add-review-container">
                <button className="back-btn" onClick={() => navigate(-1)}>&larr; Назад</button>
                <div className="review-blocked">
                    <div className="review-blocked-icon">
                        <ShoppingCart size={48} />
                    </div>
                    <h2>Відгук недоступний</h2>
                    <p>Залишити відгук можна лише після покупки цього товару.</p>
                    {product && (
                        <div className="product-miniature">
                            <img src={product?.image} alt={product?.name} />
                            <div className="product-miniature-info">
                                <h3>{product?.name}</h3>
                                <p>{product?.brand}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="add-review-container">
            <button className="back-btn" onClick={() => navigate(-1)}>&larr; Назад</button>
            <h1>Залишити відгук</h1>

            <div className="product-miniature">
                <img src={product?.image} alt={product?.name} />
                <div className="product-miniature-info">
                    <h3>{product?.name}</h3>
                    <p>{product?.brand}</p>
                </div>
            </div>

            <form className="review-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Ваша оцінка:</label>
                    <div className="rating-select">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={32}
                                className={`star ${rating >= star ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                                fill={rating >= star ? "#ffc107" : "none"}
                                stroke={rating >= star ? "#ffc107" : "currentColor"}
                            />
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="review-text">Ваш коментар:</label>
                    <textarea
                        id="review-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Поділіться вашими враженнями про цей товар..."
                        required
                    />
                </div>

                <button type="submit" className="submit-review-btn">Опублікувати відгук</button>
            </form>
        </div>
    );
};

export default AddReviewPage;
