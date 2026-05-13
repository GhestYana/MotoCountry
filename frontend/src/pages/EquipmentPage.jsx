import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import "../styles/MotoPage.css"; // Reuse existing styles
import { useSearchParams } from "react-router-dom";

const BRAND_OPTIONS = ["Alpinestars", "Dainese", "Shoei", "Arai", "LS2", "Revit"];
const TYPE_OPTIONS = [
  { value: "Шоломи", label: "Шоломи" },
  { value: "Куртки", label: "Куртки" },
  { value: "Рукавички", label: "Рукавички" },
  { value: "Мотовзуття", label: "Мотовзуття" },
  { value: "Мотоштани", label: "Мотоштани" },
  { value: "Комбінезони", label: "Комбінезони" },
  { value: "Мотожилети", label: "Мотожилети" },
  { value: "Окуляри", label: "Окуляри" },
  { value: "Моточерепахи", label: "Моточерепахи" },
  { value: "Наколінники", label: "Наколінники" },
  { value: "Кросові панцири", label: "Кросові панцири" },
  { value: "Налокітники", label: "Налокітники" }
];

const EquipmentPage = () => {
  const [items, setItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    type: searchParams.get('type') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || ''
  });

  // Sync state with URL when URL changes (e.g. from Header dropdown)
  useEffect(() => {
    setFilters({
      brand: searchParams.get('brand') || '',
      type: searchParams.get('type') || '',
      color: searchParams.get('color') || '',
      size: searchParams.get('size') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || ''
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchItems = async () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const params = new URLSearchParams(cleanFilters).toString();
      try {
        const res = await fetch(`/api/equipment?${params}`);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
      }
    };
    fetchItems();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
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
            {BRAND_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Тип</label>
          <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
            <option value="">Всі типи</option>
            {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </aside>

      <main className="moto-list-main">
        <header className="moto-list-header">
          <h2>Екіпірування</h2>
          <span className="moto-results-count">Знайдено: {items.length}</span>
        </header>
        <div className="moto-grid">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              category="equipment"
              availability={item.availability}
              image={item.image || 'https://via.placeholder.com/300x200?text=Equipment'}
              type={TYPE_OPTIONS.find(t => t.value === item.type)?.label || item.type}
              model={item.name}
              price={`${item.price} грн`}
              average_rating={item.average_rating}
              details={[
                { label: "Бренд", value: item.brand },
                { label: "Розмір", value: item.size || "-" }
              ]}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default EquipmentPage;
