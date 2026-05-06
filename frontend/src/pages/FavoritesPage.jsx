import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/MotoPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

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

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server error:", errorText);
          setFavorites([]);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          console.error("Invalid response:", data);
          setFavorites([]);
        }

      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
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
                image={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                type={item.type}
                model={item.name}
                price={`${item.price} грн`}
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
