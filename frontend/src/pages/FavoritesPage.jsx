import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/MotoPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    // 1. Initial load from local storage
    const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(localFavorites);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // 2. Auto-merge if logged in but have local guest favorites
    if (user && token && localFavorites.length > 0) {
      console.log("Merging local favorites to server...");
      try {
        await Promise.all(localFavorites.map(item =>
          item.category && fetch('/api/favorites/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.id,
              prodId: item.id,
              category: item.category
            })
          })
        ));
        localStorage.removeItem('favorites');
        window.dispatchEvent(new Event('favoritesUpdated'));
      } catch (err) {
        console.error("Failed to migrate favorites:", err);
      }
    }

    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/favorites', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('favorites');
        setFavorites([]);
        window.dispatchEvent(new Event('authUpdated'));
        window.dispatchEvent(new Event('favoritesUpdated'));
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      const normalizedData = Array.isArray(data) ? data : [];
      
      setFavorites(normalizedData);
      localStorage.setItem('favorites', JSON.stringify(normalizedData));
      window.dispatchEvent(new Event('favoritesUpdated'));

    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();

    const handleSync = () => {
      const updatedFavs = JSON.parse(localStorage.getItem('favorites')) || [];
      setFavorites(updatedFavs);
    };

    window.addEventListener('favoritesUpdated', handleSync);
    return () => window.removeEventListener('favoritesUpdated', handleSync);
  }, []);

  if (loading) return <div className="moto-page-container"><h2>Завантаження...</h2></div>;

  return (
    <div className="moto-page-container">
      <main className="moto-list-main" style={{ flex: 1 }}>
        <header className="moto-list-header">
          <h2>Обране</h2>
          <span className="moto-results-count">Збережено товарів: {favorites.length}</span>
        </header>

        {favorites.length > 0 ? (
          <div className="moto-grid">
            {favorites.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                category={item.category}
                availability={item.availability}
                image={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                type={item.type}
                model={item.name}
                price={`${item.price} грн`}
                average_rating={item.average_rating}
                details={[
                  { label: "Бренд", value: item.brand }
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
