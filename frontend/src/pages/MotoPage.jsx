import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import "../styles/MotoPage.css";

const BRAND_OPTIONS = [
  "BMW", "Harley-Davidson", "Honda", "Kawasaki", "KTM", "Suzuki", "Yamaha"
];

const TYPE_OPTIONS = [
  { value: "Sport", label: "Sport" },
  { value: "Cruiser", label: "Cruiser" },
  { value: "Adventure", label: "Adventure" },
  { value: "Scooter", label: "Scooter" },
  { value: "Naked", label: "Naked" },
  { value: "Enduro", label: "Enduro" },
  { value: "Motocross", label: "Motocross" }
];

const COLOR_OPTIONS = [
  { value: "Black", label: "Чорний" },
  { value: "Red", label: "Червоний" },
  { value: "Blue", label: "Синій" },
  { value: "White", label: "Білий" },
  { value: "Silver", label: "Сріблястий" },
  { value: "Green", label: "Зелений" },
  { value: "Orange", label: "Помаранчевий" }
];

import { useSearchParams } from "react-router-dom";

const MotoPage = () => {
  const [motorcycles, setMotorcycles] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    type: searchParams.get('type') || '',
    color: searchParams.get('color') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || ''
  });

  // Sync state with URL when URL changes
  useEffect(() => {
    setFilters({
      brand: searchParams.get('brand') || '',
      type: searchParams.get('type') || '',
      color: searchParams.get('color') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || ''
    });
  }, [searchParams]);

  const fetchMotorcycles = async () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );

    const params = new URLSearchParams(cleanFilters).toString();

    try {
      const res = await fetch(`/api/motorcycles?${params}`);
      const data = await res.json();
      setMotorcycles(data);
    } catch (error) {
      console.error("Failed to fetch motorcycles:", error);
    }
  };

  useEffect(() => {
    fetchMotorcycles();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));

    // Update URL as well
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="moto-page-container">

      {/* SIDEBAR */}
      <aside className="moto-filters-sidebar">
        <h3>Фільтри</h3>

        <div className="filter-group">
          <label>Сортування</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="">За замовчуванням</option>
            <option value="price_asc">Ціна ↑</option>
            <option value="price_desc">Ціна ↓</option>
            <option value="volume_asc">Обʼєм ↑</option>
            <option value="volume_desc">Обʼєм ↓</option>
            <option value="year_desc">Новіші</option>
            <option value="year_asc">Старіші</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Бренд</label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
          >
            <option value="">Всі бренди</option>
            {BRAND_OPTIONS.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Тип</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Всі типи</option>
            {TYPE_OPTIONS.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Колір</label>
          <select
            value={filters.color}
            onChange={(e) => handleFilterChange('color', e.target.value)}
          >
            <option value="">Всі кольори</option>
            {COLOR_OPTIONS.map(color => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
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

      {/* СПИСОК */}
      <main className="moto-list-main">
        <header className="moto-list-header">
          <h2>Мотоцикли</h2>
          <span className="moto-results-count">Знайдено: {motorcycles.length}</span>
        </header>

        <div className="moto-grid">
          {motorcycles.map((moto) => (
            <ProductCard
              key={moto.id}
              id={moto.id}
              category="motorcycle"
              image={moto.image || 'https://bikes.honda.ua/images/models/CB650R.png'}
              type={TYPE_OPTIONS.find(t => t.value === moto.type)?.label || moto.type}
              model={moto.name}
              price={`${moto.price} грн`}
              details={[{ label: "Робочий об'єм", value: `${moto.engine_displacement || '-'} см³` }]}
            />
          ))}
        </div>
      </main>

    </div>
  );
};

export default MotoPage;