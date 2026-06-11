import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { normalizeProductCategory } from '../utils/productCategory';
import '../styles/MotoPage.css'; // Reuse grid and sidebar styles

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || ''
  });

  // Sync filters with URL
  useEffect(() => {
    setFilters({
      brand: searchParams.get('brand') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || ''
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const res = await fetch('/api/motorcycles/brands'); // Basic brands for now
        const data = await res.json();
        setBrands(data);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };
    fetchMetaData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries({ ...filters, query }).filter(([_, value]) => value !== '')
        );
        const params = new URLSearchParams(cleanFilters).toString();
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, query]);

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(name, value);
    else newParams.delete(name);
    setSearchParams(newParams);
  };

  return (
    <div className="moto-page-container">
      <aside className="moto-filters-sidebar">
        <h3>Фільтри</h3>

        <div className="filter-group">
          <label>Сортування</label>
          <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
            <option value="">За замовчуванням</option>
            <option value="price_asc">Ціна ↑</option>
            <option value="price_desc">Ціна ↓</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Бренд</label>
          <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}>
            <option value="">Всі бренди</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Категорія</label>
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="">Всі категорії</option>
            <option value="motorcycle">Мотоцикли</option>
            <option value="equipment">Екіпірування</option>
            <option value="component">Запчастини</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Мін. ціна</label>
          <input
            type="number"
            placeholder="Від"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Макс. ціна</label>
          <input
            type="number"
            placeholder="До"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </aside>

      <main className="moto-list-main">
        <header className="moto-list-header">
          <h2>{query ? `Результати пошуку: "${query}"` : 'Всі товари'}</h2>
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
                category={normalizeProductCategory(product.category)}
                availability={product.availability}
                image={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                type={product.type}
                model={product.name}
                price={product.price}
                average_rating={product.average_rating}
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