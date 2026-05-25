import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/MotoPage.css';

const FavoritesPage = () => {

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);

      const token = localStorage.getItem('token');

      if (!token) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/favorites', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.error('Favorites error:', await res.text());
          setFavorites([]);
          return;
        }

        const data = await res.json();

        const list = Array.isArray(data) ? data : [];

        // Сервіс повертає вже нормалізовані поля: id, favoriteId, category, availability тощо
        // Підтримуємо обидва формати на випадок змін
        const normalized = list.map((item) => ({
          favoriteId: item.favoriteId ?? item.favorite_id,
          id: item.id ?? item.product_id,
          category: item.category || 'motorcycle',
          name: item.name || 'Товар',
          price: item.price ?? 0,
          image: item.image,
          type: item.type,
          brand: item.brand || '-',
          availability: item.availability,
          average_rating: item.average_rating || 0,
        }));

        setFavorites(normalized);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="moto-page-container">
        <h2>Завантаження...</h2>
      </div>
    );
  }

  return (
    <div className="moto-page-container">
      <main className="moto-list-main" style={{ flex: 1 }}>
        <header className="moto-list-header">
          <h2>Обране</h2>
          <span className="moto-results-count">
            Збережено товарів: {favorites.length}
          </span>
        </header>

        {favorites.length > 0 ? (
          <div className="moto-grid">
            {favorites.map((item) => (
              <ProductCard
                key={`${item.category}-${item.favoriteId}`}
                id={item.id}
                category={item.category}
                image={
                  item.image ||
                  'https://via.placeholder.com/300x200?text=Product'
                }
                type={item.type}
                model={item.name}
                price={`${item.price} грн`}
                average_rating={item.average_rating}
                availability={item.availability}
                details={[
                  { label: 'Бренд', value: item.brand },
                ]}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>У вас поки немає обраних товарів.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
