import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/MotoPage.css'; // Reuse grid styles

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get('query');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?query=${query}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  // Map search categories to backend-compatible plural forms
  const normalizeCategory = (cat) => {
    if (cat === 'product' || cat === 'motorcycle') return 'motorcycles';
    if (cat === 'equipment') return 'equipment';
    if (cat === 'component') return 'components';
    return cat;
  };

  return (
    <div className="moto-page-container" style={{ minHeight: '80vh' }}>
      <main className="moto-list-main" style={{ flex: 1 }}>
        <header className="moto-list-header">
          <h2>Результати пошуку: "{query}"</h2>
          <span className="moto-results-count">Знайдено: {products.length}</span>
        </header>

        {loading ? (
          <div className="no-results"><p>Пошук...</p></div>
        ) : products.length > 0 ? (
          <div className="moto-grid">
            {products.map(product => (
              <ProductCard
                key={`${product.category}-${product.id}`}
                id={product.id}
                category={normalizeCategory(product.category)}
                availability={product.availability}
                image={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                model={product.name}
                price={`${product.price} грн`}
                details={[
                  { label: "Бренд", value: product.brand || '-' }
                ]}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>За вашим запитом нічого не знайдено.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;