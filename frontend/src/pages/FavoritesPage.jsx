import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getFavorites, syncFavoritesFromServer } from '../utils/favoritesStorage';
import '../styles/MotoPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Спробуємо синхронізувати з сервером
          const synced = await syncFavoritesFromServer(token);
          if (synced && synced.length > 0) {
            setFavorites(synced);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Server sync failed, using local cache:', err.message);
        }
      }

      // Fallback: читаємо з localStorage
      const local = getFavorites();
      setFavorites(local);
      setLoading(false);
    };

    load();
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
                key={`${item.category}-${item.id}`}
                id={item.id}
                category={item.category}
                image={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                type={item.type}
                model={item.name || item.model}
                price={item.price}
                average_rating={item.average_rating || 0}
                availability={item.availability}
                details={[{ label: 'Бренд', value: item.brand }]}
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
